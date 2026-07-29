IF DB_ID(N'DatDoAnOnline') IS NULL
    EXEC(N'CREATE DATABASE [DatDoAnOnline]');
GO

USE [DatDoAnOnline];
GO

SET XACT_ABORT ON;
GO

IF OBJECT_ID(N'dbo.NhaHang', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.NhaHang
    (
        MaNhaHang INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_NhaHang PRIMARY KEY,
        TenNhaHang NVARCHAR(150) NOT NULL,
        DiaChi NVARCHAR(300) NOT NULL,
        SoDienThoai VARCHAR(15) NOT NULL,
        MoTa NVARCHAR(500) NULL,
        PhiGiaoHang DECIMAL(18, 2) NOT NULL
            CONSTRAINT DF_NhaHang_PhiGiaoHang DEFAULT (15000),
        CONSTRAINT CK_NhaHang_PhiGiaoHang CHECK (PhiGiaoHang >= 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.LoaiMon', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.LoaiMon
    (
        MaLoaiMon INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_LoaiMon PRIMARY KEY,
        TenLoaiMon NVARCHAR(100) NOT NULL
            CONSTRAINT UQ_LoaiMon_TenLoaiMon UNIQUE
    );
END;
GO

IF OBJECT_ID(N'dbo.MonAn', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.MonAn
    (
        MaMon INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_MonAn PRIMARY KEY,
        MaNhaHang INT NOT NULL,
        TenMon NVARCHAR(150) NOT NULL,
        MaLoaiMon INT NOT NULL,
        DonGia DECIMAL(18, 2) NOT NULL,
        TrangThai NVARCHAR(20) NOT NULL
            CONSTRAINT DF_MonAn_TrangThai DEFAULT (N'Con ban'),
        MoTa NVARCHAR(500) NULL,
        CONSTRAINT FK_MonAn_NhaHang
            FOREIGN KEY (MaNhaHang) REFERENCES dbo.NhaHang(MaNhaHang),
        CONSTRAINT FK_MonAn_LoaiMon
            FOREIGN KEY (MaLoaiMon) REFERENCES dbo.LoaiMon(MaLoaiMon),
        CONSTRAINT CK_MonAn_DonGia CHECK (DonGia >= 0),
        CONSTRAINT CK_MonAn_TrangThai
            CHECK (TrangThai IN (N'Con ban', N'Ngung ban'))
    );

    CREATE INDEX IX_MonAn_MaNhaHang_TrangThai
        ON dbo.MonAn(MaNhaHang, TrangThai, MaLoaiMon);
END;
GO

IF OBJECT_ID(N'dbo.KhachHang', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.KhachHang
    (
        MaKhachHang INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_KhachHang PRIMARY KEY,
        TenKhachHang NVARCHAR(150) NOT NULL,
        DiaChiGiaoHang NVARCHAR(300) NOT NULL,
        SoDienThoai VARCHAR(15) NOT NULL
    );

    CREATE INDEX IX_KhachHang_SoDienThoai
        ON dbo.KhachHang(SoDienThoai);
END;
GO

IF OBJECT_ID(N'dbo.DonHang', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DonHang
    (
        MaDon INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_DonHang PRIMARY KEY,
        NgayDat DATETIME2(0) NOT NULL
            CONSTRAINT DF_DonHang_NgayDat DEFAULT (SYSDATETIME()),
        MaKhachHang INT NOT NULL,
        MaNhaHang INT NOT NULL,
        TrangThai NVARCHAR(30) NOT NULL
            CONSTRAINT DF_DonHang_TrangThai DEFAULT (N'Cho xac nhan'),
        TongTien DECIMAL(18, 2) NOT NULL
            CONSTRAINT DF_DonHang_TongTien DEFAULT (0),
        TenNguoiNhan NVARCHAR(150) NULL,
        SoDienThoaiGiaoHang VARCHAR(15) NULL,
        DiaChiGiaoHang NVARCHAR(300) NULL,
        GhiChu NVARCHAR(500) NULL,
        PhuongThucThanhToan VARCHAR(10) NOT NULL
            CONSTRAINT DF_DonHang_PhuongThucThanhToan DEFAULT ('COD'),
        TienMon DECIMAL(18, 2) NOT NULL
            CONSTRAINT DF_DonHang_TienMon DEFAULT (0),
        PhiGiaoHang DECIMAL(18, 2) NOT NULL
            CONSTRAINT DF_DonHang_PhiGiaoHang DEFAULT (0),
        CONSTRAINT FK_DonHang_KhachHang
            FOREIGN KEY (MaKhachHang) REFERENCES dbo.KhachHang(MaKhachHang),
        CONSTRAINT FK_DonHang_NhaHang
            FOREIGN KEY (MaNhaHang) REFERENCES dbo.NhaHang(MaNhaHang),
        CONSTRAINT CK_DonHang_TrangThai CHECK
        (
            TrangThai IN
            (
                N'Cho xac nhan',
                N'Da xac nhan',
                N'Dang xu ly',
                N'Da hoan thanh',
                N'Da huy'
            )
        ),
        CONSTRAINT CK_DonHang_PhuongThucThanhToan
            CHECK (PhuongThucThanhToan = 'COD'),
        CONSTRAINT CK_DonHang_SoTien
            CHECK (TienMon >= 0 AND PhiGiaoHang >= 0 AND TongTien >= 0)
    );

    CREATE INDEX IX_DonHang_NgayDat
        ON dbo.DonHang(NgayDat DESC);
END;
GO

IF OBJECT_ID(N'dbo.ChiTietDonHang', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ChiTietDonHang
    (
        MaDon INT NOT NULL,
        MaMon INT NOT NULL,
        SoLuong INT NOT NULL,
        DonGiaTaiThoiDiemDat DECIMAL(18, 2) NOT NULL,
        ThanhTien AS
            CONVERT(DECIMAL(18, 2), SoLuong * DonGiaTaiThoiDiemDat) PERSISTED,
        CONSTRAINT PK_ChiTietDonHang PRIMARY KEY (MaDon, MaMon),
        CONSTRAINT FK_ChiTietDonHang_DonHang
            FOREIGN KEY (MaDon) REFERENCES dbo.DonHang(MaDon),
        CONSTRAINT FK_ChiTietDonHang_MonAn
            FOREIGN KEY (MaMon) REFERENCES dbo.MonAn(MaMon),
        CONSTRAINT CK_ChiTietDonHang_SoLuong CHECK (SoLuong > 0),
        CONSTRAINT CK_ChiTietDonHang_DonGia CHECK (DonGiaTaiThoiDiemDat >= 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.DoanhThuNhaHang', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DoanhThuNhaHang
    (
        MaNhaHang INT NOT NULL,
        Nam SMALLINT NOT NULL,
        Thang TINYINT NOT NULL,
        TongDoanhThu DECIMAL(18, 2) NOT NULL,
        CONSTRAINT PK_DoanhThuNhaHang PRIMARY KEY (MaNhaHang, Nam, Thang),
        CONSTRAINT FK_DoanhThuNhaHang_NhaHang
            FOREIGN KEY (MaNhaHang) REFERENCES dbo.NhaHang(MaNhaHang),
        CONSTRAINT CK_DoanhThuNhaHang_Thang CHECK (Thang BETWEEN 1 AND 12),
        CONSTRAINT CK_DoanhThuNhaHang_Tong CHECK (TongDoanhThu >= 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.LichSuTrangThaiDonHang', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.LichSuTrangThaiDonHang
    (
        MaLichSu BIGINT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_LichSuTrangThaiDonHang PRIMARY KEY,
        MaDon INT NOT NULL,
        TrangThai NVARCHAR(30) NOT NULL,
        ThoiDiem DATETIME2(0) NOT NULL
            CONSTRAINT DF_LichSuTrangThaiDonHang_ThoiDiem DEFAULT (SYSDATETIME()),
        CONSTRAINT FK_LichSuTrangThaiDonHang_DonHang
            FOREIGN KEY (MaDon) REFERENCES dbo.DonHang(MaDon),
        CONSTRAINT CK_LichSuTrangThaiDonHang_TrangThai CHECK
        (
            TrangThai IN
            (
                N'Cho xac nhan',
                N'Da xac nhan',
                N'Dang xu ly',
                N'Da hoan thanh',
                N'Da huy'
            )
        )
    );

    CREATE INDEX IX_LichSuTrangThaiDonHang_MaDon_ThoiDiem
        ON dbo.LichSuTrangThaiDonHang(MaDon, ThoiDiem, MaLichSu);
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_KiemTraChiTietDonHang
ON dbo.ChiTietDonHang
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM deleted)
       AND (UPDATE(MaDon) OR UPDATE(MaMon) OR UPDATE(DonGiaTaiThoiDiemDat))
        THROW 50001, N'Khong duoc thay doi khoa hoac don gia lich su.', 1;

    IF EXISTS
    (
        SELECT 1
        FROM inserted AS i
        INNER JOIN dbo.DonHang AS dh ON dh.MaDon = i.MaDon
        INNER JOIN dbo.MonAn AS ma ON ma.MaMon = i.MaMon
        WHERE dh.MaNhaHang <> ma.MaNhaHang
    )
        THROW 50002, N'Mon an khong thuoc nha hang cua don hang.', 1;

    IF EXISTS
    (
        SELECT 1
        FROM inserted AS i
        INNER JOIN dbo.DonHang AS dh ON dh.MaDon = i.MaDon
        WHERE dh.TrangThai <> N'Cho xac nhan'
    )
        THROW 50003, N'Chi duoc sua chi tiet cua don cho xac nhan.', 1;

    IF EXISTS
    (
        SELECT 1
        FROM inserted AS i
        INNER JOIN dbo.MonAn AS ma ON ma.MaMon = i.MaMon
        WHERE ma.TrangThai <> N'Con ban'
    )
        THROW 50004, N'Mon an da ngung ban.', 1;

    IF EXISTS
    (
        SELECT 1
        FROM inserted AS i
        INNER JOIN dbo.MonAn AS ma ON ma.MaMon = i.MaMon
        LEFT JOIN deleted AS d
            ON d.MaDon = i.MaDon AND d.MaMon = i.MaMon
        WHERE d.MaDon IS NULL
          AND i.DonGiaTaiThoiDiemDat <> ma.DonGia
    )
        THROW 50005, N'Don gia dat phai bang gia hien tai cua mon.', 1;
END;
GO
