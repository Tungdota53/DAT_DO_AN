import sql from "mssql/msnodesqlv8.js";

import { databasePool } from "../config/database.js";
import type {
  Food,
  FoodCategory,
  FoodStatus,
  Restaurant,
} from "../types/domain.js";
import { toFoodStatus } from "../utils/status-mapper.js";

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

interface FoodRow {
  MaMon: number;
  MaNhaHang: number;
  MaLoaiMon: number;
  TenLoaiMon: string;
  TenMon: string;
  MoTa: string | null;
  DonGia: number;
  TrangThai: string;
}

const mapRestaurant = (row: RestaurantRow): Restaurant => ({
  id: row.MaNhaHang,
  name: row.TenNhaHang,
  address: row.DiaChi,
  phone: row.SoDienThoai,
  description: row.MoTa,
  deliveryFee: Number(row.PhiGiaoHang),
  availableFoodCount: row.SoMonDangBan,
  minPrice: row.GiaThapNhat === null ? null : Number(row.GiaThapNhat),
});

const mapFood = (row: FoodRow): Food => ({
  id: row.MaMon,
  restaurantId: row.MaNhaHang,
  categoryId: row.MaLoaiMon,
  categoryName: row.TenLoaiMon,
  name: row.TenMon,
  description: row.MoTa,
  price: Number(row.DonGia),
  status: toFoodStatus(row.TrangThai),
});

export interface ListRestaurantsInput {
  page: number;
  limit: number;
  search: string;
}

export interface ListFoodsInput extends ListRestaurantsInput {
  restaurantId: number;
  categoryId?: number | undefined;
  status?: FoodStatus | undefined;
}

export class RestaurantRepository {
  public async list(input: ListRestaurantsInput) {
    const offset = (input.page - 1) * input.limit;
    const request = databasePool.request();
    request.input("search", sql.NVarChar(100), `%${input.search}%`);
    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, input.limit);

    const result = await request.query<RestaurantRow & { TotalItems: number }>(`
      SELECT
        nh.MaNhaHang,
        nh.TenNhaHang,
        nh.DiaChi,
        nh.SoDienThoai,
        nh.MoTa,
        nh.PhiGiaoHang,
        COUNT(CASE WHEN ma.TrangThai = N'Con ban' THEN 1 END) AS SoMonDangBan,
        MIN(CASE WHEN ma.TrangThai = N'Con ban' THEN ma.DonGia END) AS GiaThapNhat,
        COUNT(*) OVER() AS TotalItems
      FROM dbo.NhaHang AS nh
      LEFT JOIN dbo.MonAn AS ma ON ma.MaNhaHang = nh.MaNhaHang
      WHERE
        @search = N'%%'
        OR nh.TenNhaHang COLLATE Vietnamese_CI_AI LIKE @search COLLATE Vietnamese_CI_AI
        OR nh.DiaChi COLLATE Vietnamese_CI_AI LIKE @search COLLATE Vietnamese_CI_AI
      GROUP BY
        nh.MaNhaHang,
        nh.TenNhaHang,
        nh.DiaChi,
        nh.SoDienThoai,
        nh.MoTa,
        nh.PhiGiaoHang
      ORDER BY nh.MaNhaHang
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `);

    return {
      items: result.recordset.map(mapRestaurant),
      totalItems: result.recordset[0]?.TotalItems ?? 0,
    };
  }

  public async findById(restaurantId: number): Promise<Restaurant | null> {
    const result = await databasePool
      .request()
      .input("restaurantId", sql.Int, restaurantId).query<RestaurantRow>(`
        SELECT
          nh.MaNhaHang,
          nh.TenNhaHang,
          nh.DiaChi,
          nh.SoDienThoai,
          nh.MoTa,
          nh.PhiGiaoHang,
          COUNT(CASE WHEN ma.TrangThai = N'Con ban' THEN 1 END) AS SoMonDangBan,
          MIN(CASE WHEN ma.TrangThai = N'Con ban' THEN ma.DonGia END) AS GiaThapNhat
        FROM dbo.NhaHang AS nh
        LEFT JOIN dbo.MonAn AS ma ON ma.MaNhaHang = nh.MaNhaHang
        WHERE nh.MaNhaHang = @restaurantId
        GROUP BY
          nh.MaNhaHang,
          nh.TenNhaHang,
          nh.DiaChi,
          nh.SoDienThoai,
          nh.MoTa,
          nh.PhiGiaoHang;
      `);

    const row = result.recordset[0];
    return row ? mapRestaurant(row) : null;
  }

  public async listCategories(restaurantId: number): Promise<FoodCategory[]> {
    const result = await databasePool
      .request()
      .input("restaurantId", sql.Int, restaurantId).query<{
      MaLoaiMon: number;
      TenLoaiMon: string;
    }>(`
        SELECT DISTINCT lm.MaLoaiMon, lm.TenLoaiMon
        FROM dbo.LoaiMon AS lm
        INNER JOIN dbo.MonAn AS ma ON ma.MaLoaiMon = lm.MaLoaiMon
        WHERE ma.MaNhaHang = @restaurantId
        ORDER BY lm.TenLoaiMon;
      `);

    return result.recordset.map((row) => ({
      id: row.MaLoaiMon,
      name: row.TenLoaiMon,
    }));
  }

  public async listFoods(input: ListFoodsInput) {
    const offset = (input.page - 1) * input.limit;
    const statusValue =
      input.status === undefined
        ? null
        : input.status === "NGUNG_BAN"
          ? "Ngung ban"
          : "Con ban";
    const request = databasePool.request();
    request.input("restaurantId", sql.Int, input.restaurantId);
    request.input("search", sql.NVarChar(100), `%${input.search}%`);
    request.input("categoryId", sql.Int, input.categoryId ?? null);
    request.input("status", sql.NVarChar(20), statusValue);
    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, input.limit);

    const result = await request.query<FoodRow & { TotalItems: number }>(`
      SELECT
        ma.MaMon,
        ma.MaNhaHang,
        ma.MaLoaiMon,
        lm.TenLoaiMon,
        ma.TenMon,
        ma.MoTa,
        ma.DonGia,
        ma.TrangThai,
        COUNT(*) OVER() AS TotalItems
      FROM dbo.MonAn AS ma
      INNER JOIN dbo.LoaiMon AS lm ON lm.MaLoaiMon = ma.MaLoaiMon
      WHERE ma.MaNhaHang = @restaurantId
        AND (@search = N'%%' OR ma.TenMon COLLATE Vietnamese_CI_AI LIKE @search COLLATE Vietnamese_CI_AI)
        AND (@categoryId IS NULL OR ma.MaLoaiMon = @categoryId)
        AND (@status IS NULL OR ma.TrangThai = @status)
      ORDER BY ma.TrangThai, ma.MaMon
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `);

    return {
      items: result.recordset.map(mapFood),
      totalItems: result.recordset[0]?.TotalItems ?? 0,
    };
  }
}

export const restaurantRepository = new RestaurantRepository();
