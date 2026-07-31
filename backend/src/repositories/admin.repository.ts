import sql from "mssql/msnodesqlv8.js";

import { databasePool } from "../config/database.js";
import { AppError } from "../errors/app-error.js";
import type {
  AdminCategory,
  AdminCustomer,
  AdminDashboard,
  AdminFood,
  AdminOrder,
  AdminOrderPage,
  AdminRestaurant,
  CategoryMutation,
  CustomerMutation,
  FoodMutation,
  RestaurantMutation,
} from "../types/admin.js";
import type { OrderStatus } from "../types/domain.js";
import { isOrderStatusTransitionAllowed } from "../utils/order-transitions.js";
import {
  toDatabaseFoodStatus,
  toDatabaseOrderStatus,
  toFoodStatus,
  toOrderStatus,
} from "../utils/status-mapper.js";

interface RestaurantRow {
  MaNhaHang: number;
  TenNhaHang: string;
  DiaChi: string;
  SoDienThoai: string;
  MoTa: string | null;
  PhiGiaoHang: number;
  SoMonDangBan: number;
  GiaThapNhat: number | null;
}

interface CategoryRow {
  MaLoaiMon: number;
  TenLoaiMon: string;
  SoMon: number;
}

interface FoodRow {
  MaMon: number;
  MaNhaHang: number;
  TenNhaHang: string;
  MaLoaiMon: number;
  TenLoaiMon: string;
  TenMon: string;
  MoTa: string | null;
  DonGia: number;
  TrangThai: string;
}

interface OrderRow {
  MaDon: number;
  NgayDat: Date;
  TrangThai: string;
  MaNhaHang: number;
  TenNhaHang: string;
  TenNguoiNhan: string;
  SoDienThoaiGiaoHang: string;
  DiaChiGiaoHang: string;
  SoMon: number;
  TongTien: number;
}

interface CustomerRow {
  MaKhachHang: number;
  TenKhachHang: string;
  SoDienThoai: string;
  DiaChiGiaoHang: string;
  SoDon: number;
  TongChiTieu: number;
  DonGanNhat: Date | null;
}

interface OrderListOptions {
  status?: OrderStatus | undefined;
  page?: number;
  limit?: number;
  search?: string;
}

const mapRestaurant = (row: RestaurantRow): AdminRestaurant => ({
  id: row.MaNhaHang,
  name: row.TenNhaHang,
  address: row.DiaChi,
  phone: row.SoDienThoai,
  description: row.MoTa,
  deliveryFee: Number(row.PhiGiaoHang),
  availableFoodCount: Number(row.SoMonDangBan),
  minPrice: row.GiaThapNhat === null ? null : Number(row.GiaThapNhat),
});

const mapCategory = (row: CategoryRow): AdminCategory => ({
  id: row.MaLoaiMon,
  name: row.TenLoaiMon,
  foodCount: Number(row.SoMon),
});

const mapFood = (row: FoodRow): AdminFood => ({
  id: row.MaMon,
  restaurantId: row.MaNhaHang,
  restaurantName: row.TenNhaHang,
  categoryId: row.MaLoaiMon,
  categoryName: row.TenLoaiMon,
  name: row.TenMon,
  description: row.MoTa,
  price: Number(row.DonGia),
  status: toFoodStatus(row.TrangThai),
});

const mapOrder = (row: OrderRow): AdminOrder => ({
  id: row.MaDon,
  createdAt: row.NgayDat.toISOString(),
  status: toOrderStatus(row.TrangThai),
  restaurantId: row.MaNhaHang,
  restaurantName: row.TenNhaHang,
  recipientName: row.TenNguoiNhan,
  recipientPhone: row.SoDienThoaiGiaoHang,
  deliveryAddress: row.DiaChiGiaoHang,
  itemCount: Number(row.SoMon),
  total: Number(row.TongTien),
});

const mapCustomer = (row: CustomerRow): AdminCustomer => ({
  id: row.MaKhachHang,
  name: row.TenKhachHang,
  phone: row.SoDienThoai,
  deliveryAddress: row.DiaChiGiaoHang,
  orderCount: Number(row.SoDon),
  totalSpent: Number(row.TongChiTieu),
  lastOrderAt: row.DonGanNhat?.toISOString() ?? null,
});

const rethrowCategoryConflict = (error: unknown): never => {
  const databaseError = error as { number?: unknown } | null;
  if (
    databaseError &&
    (databaseError.number === 2601 || databaseError.number === 2627)
  ) {
    throw new AppError(
      409,
      "CONFLICT",
      "Tên danh mục này đã tồn tại. Hãy chọn một tên khác.",
    );
  }
  throw error;
};

const restaurantSelect = `
  SELECT
    nh.MaNhaHang, nh.TenNhaHang, nh.DiaChi, nh.SoDienThoai,
    nh.MoTa, nh.PhiGiaoHang,
    COUNT(CASE WHEN ma.TrangThai = N'Con ban' THEN 1 END) AS SoMonDangBan,
    MIN(CASE WHEN ma.TrangThai = N'Con ban' THEN ma.DonGia END) AS GiaThapNhat
  FROM dbo.NhaHang AS nh
  LEFT JOIN dbo.MonAn AS ma ON ma.MaNhaHang = nh.MaNhaHang
`;

const orderSelect = `
  SELECT
    dh.MaDon, dh.NgayDat, dh.TrangThai,
    nh.MaNhaHang, nh.TenNhaHang,
    COALESCE(dh.TenNguoiNhan, kh.TenKhachHang) AS TenNguoiNhan,
    COALESCE(dh.SoDienThoaiGiaoHang, kh.SoDienThoai) AS SoDienThoaiGiaoHang,
    COALESCE(dh.DiaChiGiaoHang, kh.DiaChiGiaoHang) AS DiaChiGiaoHang,
    COALESCE(SUM(ct.SoLuong), 0) AS SoMon,
    dh.TongTien
  FROM dbo.DonHang AS dh
  INNER JOIN dbo.NhaHang AS nh ON nh.MaNhaHang = dh.MaNhaHang
  INNER JOIN dbo.KhachHang AS kh ON kh.MaKhachHang = dh.MaKhachHang
  LEFT JOIN dbo.ChiTietDonHang AS ct ON ct.MaDon = dh.MaDon
`;

export class AdminRepository {
  public async getDashboard(): Promise<AdminDashboard> {
    const [metricsResult, recentOrdersPage] = await Promise.all([
      databasePool.request().query<{
        SoNhaHang: number;
        SoMon: number;
        SoKhach: number;
        SoDon: number;
        SoDonCho: number;
        TongGiaTriDon: number;
      }>(`
        SELECT
          (SELECT COUNT(*) FROM dbo.NhaHang) AS SoNhaHang,
          (SELECT COUNT(*) FROM dbo.MonAn) AS SoMon,
          (SELECT COUNT(*) FROM dbo.KhachHang) AS SoKhach,
          (SELECT COUNT(*) FROM dbo.DonHang) AS SoDon,
          (
            SELECT COUNT(*) FROM dbo.DonHang
            WHERE TrangThai IN (N'Cho xac nhan', N'Da xac nhan', N'Dang xu ly')
          ) AS SoDonCho,
          (
            SELECT COALESCE(SUM(TongTien), 0) FROM dbo.DonHang
            WHERE TrangThai <> N'Da huy'
          ) AS TongGiaTriDon;
      `),
      this.listOrders({ limit: 6 }),
    ]);

    const metrics = metricsResult.recordset[0];
    return {
      restaurantCount: Number(metrics?.SoNhaHang ?? 0),
      foodCount: Number(metrics?.SoMon ?? 0),
      customerCount: Number(metrics?.SoKhach ?? 0),
      orderCount: Number(metrics?.SoDon ?? 0),
      pendingOrderCount: Number(metrics?.SoDonCho ?? 0),
      totalOrderValue: Number(metrics?.TongGiaTriDon ?? 0),
      recentOrders: recentOrdersPage.items,
    };
  }

  public async listRestaurants(): Promise<AdminRestaurant[]> {
    const result = await databasePool.request().query<RestaurantRow>(`
      ${restaurantSelect}
      GROUP BY
        nh.MaNhaHang, nh.TenNhaHang, nh.DiaChi, nh.SoDienThoai,
        nh.MoTa, nh.PhiGiaoHang
      ORDER BY nh.MaNhaHang DESC;
    `);
    return result.recordset.map(mapRestaurant);
  }

  public async findRestaurant(id: number): Promise<AdminRestaurant | null> {
    const result = await databasePool
      .request()
      .input("id", sql.Int, id).query<RestaurantRow>(`
        ${restaurantSelect}
        WHERE nh.MaNhaHang = @id
        GROUP BY
          nh.MaNhaHang, nh.TenNhaHang, nh.DiaChi, nh.SoDienThoai,
          nh.MoTa, nh.PhiGiaoHang;
      `);
    const row = result.recordset[0];
    return row ? mapRestaurant(row) : null;
  }

  public async createRestaurant(
    input: RestaurantMutation,
  ): Promise<AdminRestaurant> {
    const result = await databasePool
      .request()
      .input("name", sql.NVarChar(150), input.name)
      .input("address", sql.NVarChar(300), input.address)
      .input("phone", sql.VarChar(15), input.phone)
      .input("description", sql.NVarChar(500), input.description)
      .input("deliveryFee", sql.Decimal(18, 2), input.deliveryFee)
      .query<{ id: number }>(`
        INSERT INTO dbo.NhaHang
          (TenNhaHang, DiaChi, SoDienThoai, MoTa, PhiGiaoHang)
        OUTPUT inserted.MaNhaHang AS id
        VALUES (@name, @address, @phone, @description, @deliveryFee);
      `);
    const id = result.recordset[0]?.id;
    const created = id ? await this.findRestaurant(id) : null;
    if (!created) {
      throw new AppError(
        500,
        "DATABASE_ERROR",
        "Không thể đọc nhà hàng vừa tạo",
      );
    }
    return created;
  }

  public async updateRestaurant(
    id: number,
    input: RestaurantMutation,
  ): Promise<AdminRestaurant | null> {
    const result = await databasePool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar(150), input.name)
      .input("address", sql.NVarChar(300), input.address)
      .input("phone", sql.VarChar(15), input.phone)
      .input("description", sql.NVarChar(500), input.description)
      .input("deliveryFee", sql.Decimal(18, 2), input.deliveryFee).query(`
        UPDATE dbo.NhaHang
        SET TenNhaHang = @name,
            DiaChi = @address,
            SoDienThoai = @phone,
            MoTa = @description,
            PhiGiaoHang = @deliveryFee
        WHERE MaNhaHang = @id;
      `);
    if ((result.rowsAffected[0] ?? 0) === 0) return null;
    return this.findRestaurant(id);
  }

  public async deleteRestaurant(id: number): Promise<boolean> {
    const dependencies = await databasePool
      .request()
      .input("id", sql.Int, id).query<{ SoMon: number; SoDon: number }>(`
        SELECT
          (SELECT COUNT(*) FROM dbo.MonAn WHERE MaNhaHang = @id) AS SoMon,
          (SELECT COUNT(*) FROM dbo.DonHang WHERE MaNhaHang = @id) AS SoDon;
      `);
    const counts = dependencies.recordset[0];
    if (Number(counts?.SoMon ?? 0) > 0 || Number(counts?.SoDon ?? 0) > 0) {
      throw new AppError(
        409,
        "CONFLICT",
        "Không thể xóa nhà hàng đang có món ăn hoặc đơn hàng",
      );
    }
    const result = await databasePool
      .request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM dbo.NhaHang WHERE MaNhaHang = @id;`);
    return (result.rowsAffected[0] ?? 0) > 0;
  }

  public async listCategories(): Promise<AdminCategory[]> {
    const result = await databasePool.request().query<CategoryRow>(`
      SELECT
        lm.MaLoaiMon, lm.TenLoaiMon, COUNT(ma.MaMon) AS SoMon
      FROM dbo.LoaiMon AS lm
      LEFT JOIN dbo.MonAn AS ma ON ma.MaLoaiMon = lm.MaLoaiMon
      GROUP BY lm.MaLoaiMon, lm.TenLoaiMon
      ORDER BY lm.TenLoaiMon;
    `);
    return result.recordset.map(mapCategory);
  }

  public async createCategory(
    input: CategoryMutation,
  ): Promise<AdminCategory> {
    const result = await databasePool
      .request()
      .input("name", sql.NVarChar(100), input.name)
      .query<CategoryRow>(`
        INSERT INTO dbo.LoaiMon (TenLoaiMon)
        OUTPUT inserted.MaLoaiMon, inserted.TenLoaiMon, 0 AS SoMon
        VALUES (@name);
      `)
      .catch(rethrowCategoryConflict);
    const row = result.recordset[0];
    if (!row) {
      throw new AppError(500, "DATABASE_ERROR", "Không thể tạo danh mục");
    }
    return mapCategory(row);
  }

  public async updateCategory(
    id: number,
    input: CategoryMutation,
  ): Promise<AdminCategory | null> {
    const result = await databasePool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar(100), input.name)
      .query(
        `UPDATE dbo.LoaiMon SET TenLoaiMon = @name WHERE MaLoaiMon = @id;`,
      )
      .catch(rethrowCategoryConflict);
    if ((result.rowsAffected[0] ?? 0) === 0) return null;
    const categories = await this.listCategories();
    return categories.find((category) => category.id === id) ?? null;
  }

  public async deleteCategory(id: number): Promise<boolean> {
    const dependency = await databasePool
      .request()
      .input("id", sql.Int, id)
      .query<{ SoMon: number }>(
        `SELECT COUNT(*) AS SoMon FROM dbo.MonAn WHERE MaLoaiMon = @id;`,
      );
    if (Number(dependency.recordset[0]?.SoMon ?? 0) > 0) {
      throw new AppError(
        409,
        "CONFLICT",
        "Không thể xóa danh mục đang được món ăn sử dụng",
      );
    }
    const result = await databasePool
      .request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM dbo.LoaiMon WHERE MaLoaiMon = @id;`);
    return (result.rowsAffected[0] ?? 0) > 0;
  }

  public async listFoods(restaurantId?: number): Promise<AdminFood[]> {
    const request = databasePool.request();
    request.input("restaurantId", sql.Int, restaurantId ?? null);
    const result = await request.query<FoodRow>(`
      SELECT
        ma.MaMon, ma.MaNhaHang, nh.TenNhaHang,
        ma.MaLoaiMon, lm.TenLoaiMon,
        ma.TenMon, ma.MoTa, ma.DonGia, ma.TrangThai
      FROM dbo.MonAn AS ma
      INNER JOIN dbo.NhaHang AS nh ON nh.MaNhaHang = ma.MaNhaHang
      INNER JOIN dbo.LoaiMon AS lm ON lm.MaLoaiMon = ma.MaLoaiMon
      WHERE (@restaurantId IS NULL OR ma.MaNhaHang = @restaurantId)
      ORDER BY ma.MaNhaHang, ma.TrangThai, ma.MaMon DESC;
    `);
    return result.recordset.map(mapFood);
  }

  public async createFood(input: FoodMutation): Promise<AdminFood> {
    await this.assertRestaurantAndCategory(input.restaurantId, input.categoryId);
    const result = await databasePool
      .request()
      .input("restaurantId", sql.Int, input.restaurantId)
      .input("categoryId", sql.Int, input.categoryId)
      .input("name", sql.NVarChar(150), input.name)
      .input("description", sql.NVarChar(500), input.description)
      .input("price", sql.Decimal(18, 2), input.price)
      .input(
        "status",
        sql.NVarChar(20),
        toDatabaseFoodStatus(input.status),
      ).query<{ id: number }>(`
        INSERT INTO dbo.MonAn
          (MaNhaHang, MaLoaiMon, TenMon, MoTa, DonGia, TrangThai)
        OUTPUT inserted.MaMon AS id
        VALUES
          (@restaurantId, @categoryId, @name, @description, @price, @status);
      `);
    const id = result.recordset[0]?.id;
    const foods = await this.listFoods(input.restaurantId);
    const created = foods.find((food) => food.id === id);
    if (!created) {
      throw new AppError(500, "DATABASE_ERROR", "Không thể đọc món vừa tạo");
    }
    return created;
  }

  public async updateFood(
    id: number,
    input: FoodMutation,
  ): Promise<AdminFood | null> {
    await this.assertRestaurantAndCategory(input.restaurantId, input.categoryId);
    const result = await databasePool
      .request()
      .input("id", sql.Int, id)
      .input("restaurantId", sql.Int, input.restaurantId)
      .input("categoryId", sql.Int, input.categoryId)
      .input("name", sql.NVarChar(150), input.name)
      .input("description", sql.NVarChar(500), input.description)
      .input("price", sql.Decimal(18, 2), input.price)
      .input(
        "status",
        sql.NVarChar(20),
        toDatabaseFoodStatus(input.status),
      ).query(`
        UPDATE dbo.MonAn
        SET MaNhaHang = @restaurantId,
            MaLoaiMon = @categoryId,
            TenMon = @name,
            MoTa = @description,
            DonGia = @price,
            TrangThai = @status
        WHERE MaMon = @id;
      `);
    if ((result.rowsAffected[0] ?? 0) === 0) return null;
    const foods = await this.listFoods(input.restaurantId);
    return foods.find((food) => food.id === id) ?? null;
  }

  public async deleteFood(id: number): Promise<boolean> {
    const dependency = await databasePool
      .request()
      .input("id", sql.Int, id)
      .query<{ SoDon: number }>(
        `SELECT COUNT(*) AS SoDon FROM dbo.ChiTietDonHang WHERE MaMon = @id;`,
      );
    if (Number(dependency.recordset[0]?.SoDon ?? 0) > 0) {
      throw new AppError(
        409,
        "CONFLICT",
        "Không thể xóa món đã xuất hiện trong đơn hàng; hãy chuyển sang ngừng bán",
      );
    }
    const result = await databasePool
      .request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM dbo.MonAn WHERE MaMon = @id;`);
    return (result.rowsAffected[0] ?? 0) > 0;
  }

  public async listOrders(
    options: OrderListOptions = {},
  ): Promise<AdminOrderPage> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(50, Math.max(1, options.limit ?? 20));
    const offset = (page - 1) * limit;
    const search = options.search?.trim() ?? "";
    const databaseStatus = options.status
      ? toDatabaseOrderStatus(options.status)
      : null;
    const searchPattern = `%${search}%`;
    const hasSearch = search.length > 0 ? 1 : 0;

    const [ordersResult, countResult] = await Promise.all([
      databasePool
        .request()
        .input("status", sql.NVarChar(30), databaseStatus)
        .input("search", sql.NVarChar(202), searchPattern)
        .input("hasSearch", sql.Bit, hasSearch)
        .input("offset", sql.Int, offset)
        .input("limit", sql.Int, limit).query<OrderRow>(`
          ${orderSelect}
          WHERE (@status IS NULL OR dh.TrangThai = @status)
            AND (
              @hasSearch = 0
              OR CONVERT(NVARCHAR(20), dh.MaDon) LIKE @search
              OR nh.TenNhaHang LIKE @search
              OR COALESCE(dh.TenNguoiNhan, kh.TenKhachHang) LIKE @search
              OR COALESCE(dh.SoDienThoaiGiaoHang, kh.SoDienThoai) LIKE @search
            )
          GROUP BY
            dh.MaDon, dh.NgayDat, dh.TrangThai,
            nh.MaNhaHang, nh.TenNhaHang,
            dh.TenNguoiNhan, kh.TenKhachHang,
            dh.SoDienThoaiGiaoHang, kh.SoDienThoai,
            dh.DiaChiGiaoHang, kh.DiaChiGiaoHang,
            dh.TongTien
          ORDER BY dh.NgayDat DESC, dh.MaDon DESC
          OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
        `),
      databasePool
        .request()
        .input("status", sql.NVarChar(30), databaseStatus)
        .input("search", sql.NVarChar(202), searchPattern)
        .input("hasSearch", sql.Bit, hasSearch).query<{ Tong: number }>(`
          SELECT COUNT(*) AS Tong
          FROM dbo.DonHang AS dh
          INNER JOIN dbo.NhaHang AS nh ON nh.MaNhaHang = dh.MaNhaHang
          INNER JOIN dbo.KhachHang AS kh ON kh.MaKhachHang = dh.MaKhachHang
          WHERE (@status IS NULL OR dh.TrangThai = @status)
            AND (
              @hasSearch = 0
              OR CONVERT(NVARCHAR(20), dh.MaDon) LIKE @search
              OR nh.TenNhaHang LIKE @search
              OR COALESCE(dh.TenNguoiNhan, kh.TenKhachHang) LIKE @search
              OR COALESCE(dh.SoDienThoaiGiaoHang, kh.SoDienThoai) LIKE @search
            );
        `),
    ]);
    const total = Number(countResult.recordset[0]?.Tong ?? 0);

    return {
      items: ordersResult.recordset.map(mapOrder),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  public async updateOrderStatus(
    id: number,
    status: OrderStatus,
  ): Promise<AdminOrder | null> {
    const transaction = new sql.Transaction(databasePool);
    await transaction.begin();
    try {
      const currentResult = await new sql.Request(transaction)
        .input("id", sql.Int, id)
        .query<{ TrangThai: string }>(
          `SELECT TrangThai FROM dbo.DonHang WITH (UPDLOCK) WHERE MaDon = @id;`,
        );
      const current = currentResult.recordset[0];
      if (!current) {
        await transaction.rollback();
        return null;
      }
      const currentStatus = toOrderStatus(current.TrangThai);
      if (!isOrderStatusTransitionAllowed(currentStatus, status)) {
        throw new AppError(
          409,
          "CONFLICT",
          "Không thể chuyển đơn hàng sang trạng thái này.",
        );
      }
      const databaseStatus = toDatabaseOrderStatus(status);
      if (current.TrangThai !== databaseStatus) {
        await new sql.Request(transaction)
          .input("id", sql.Int, id)
          .input("status", sql.NVarChar(30), databaseStatus).query(`
            UPDATE dbo.DonHang SET TrangThai = @status WHERE MaDon = @id;
            INSERT INTO dbo.LichSuTrangThaiDonHang
              (MaDon, TrangThai, ThoiDiem)
            VALUES (@id, @status, SYSDATETIME());
          `);
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    const result = await databasePool
      .request()
      .input("id", sql.Int, id).query<OrderRow>(`
        ${orderSelect}
        WHERE dh.MaDon = @id
        GROUP BY
          dh.MaDon, dh.NgayDat, dh.TrangThai,
          nh.MaNhaHang, nh.TenNhaHang,
          dh.TenNguoiNhan, kh.TenKhachHang,
          dh.SoDienThoaiGiaoHang, kh.SoDienThoai,
          dh.DiaChiGiaoHang, kh.DiaChiGiaoHang,
          dh.TongTien;
      `);
    const row = result.recordset[0];
    return row ? mapOrder(row) : null;
  }

  public async listCustomers(): Promise<AdminCustomer[]> {
    const result = await databasePool.request().query<CustomerRow>(`
      SELECT
        kh.MaKhachHang, kh.TenKhachHang, kh.SoDienThoai,
        kh.DiaChiGiaoHang,
        COUNT(dh.MaDon) AS SoDon,
        COALESCE(SUM(CASE WHEN dh.TrangThai <> N'Da huy' THEN dh.TongTien ELSE 0 END), 0)
          AS TongChiTieu,
        MAX(dh.NgayDat) AS DonGanNhat
      FROM dbo.KhachHang AS kh
      LEFT JOIN dbo.DonHang AS dh ON dh.MaKhachHang = kh.MaKhachHang
      GROUP BY
        kh.MaKhachHang, kh.TenKhachHang, kh.SoDienThoai, kh.DiaChiGiaoHang
      ORDER BY DonGanNhat DESC, kh.MaKhachHang DESC;
    `);
    return result.recordset.map(mapCustomer);
  }

  public async updateCustomer(
    id: number,
    input: CustomerMutation,
  ): Promise<AdminCustomer | null> {
    const result = await databasePool
      .request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar(150), input.name)
      .input("phone", sql.VarChar(15), input.phone)
      .input("deliveryAddress", sql.NVarChar(300), input.deliveryAddress)
      .query(`
        UPDATE dbo.KhachHang
        SET TenKhachHang = @name,
            SoDienThoai = @phone,
            DiaChiGiaoHang = @deliveryAddress
        WHERE MaKhachHang = @id;
      `);
    if ((result.rowsAffected[0] ?? 0) === 0) return null;
    const customers = await this.listCustomers();
    return customers.find((customer) => customer.id === id) ?? null;
  }

  public async deleteCustomer(id: number): Promise<boolean> {
    const dependency = await databasePool
      .request()
      .input("id", sql.Int, id)
      .query<{ SoDon: number }>(
        `SELECT COUNT(*) AS SoDon FROM dbo.DonHang WHERE MaKhachHang = @id;`,
      );
    if (Number(dependency.recordset[0]?.SoDon ?? 0) > 0) {
      throw new AppError(
        409,
        "CONFLICT",
        "Không thể xóa khách hàng đã có lịch sử đơn hàng",
      );
    }
    const result = await databasePool
      .request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM dbo.KhachHang WHERE MaKhachHang = @id;`);
    return (result.rowsAffected[0] ?? 0) > 0;
  }

  private async assertRestaurantAndCategory(
    restaurantId: number,
    categoryId: number,
  ) {
    const result = await databasePool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .input("categoryId", sql.Int, categoryId)
      .query<{ CoNhaHang: number; CoDanhMuc: number }>(`
        SELECT
          CASE WHEN EXISTS (
            SELECT 1 FROM dbo.NhaHang WHERE MaNhaHang = @restaurantId
          ) THEN 1 ELSE 0 END AS CoNhaHang,
          CASE WHEN EXISTS (
            SELECT 1 FROM dbo.LoaiMon WHERE MaLoaiMon = @categoryId
          ) THEN 1 ELSE 0 END AS CoDanhMuc;
      `);
    const entities = result.recordset[0];
    if (!entities?.CoNhaHang) {
      throw new AppError(
        404,
        "RESTAURANT_NOT_FOUND",
        "Không tìm thấy nhà hàng",
      );
    }
    if (!entities.CoDanhMuc) {
      throw new AppError(
        404,
        "CATEGORY_NOT_FOUND",
        "Không tìm thấy danh mục món",
      );
    }
  }
}

export const adminRepository = new AdminRepository();
