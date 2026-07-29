USE [DatDoAnOnline];
GO

SET XACT_ABORT ON;
GO

/*
  FoodGo MVP migration.
  This script is additive and can be run more than once. It preserves existing
  customer and order data while adding the metadata and snapshots required by
  the public ordering API.
*/

IF COL_LENGTH(N'dbo.NhaHang', N'MoTa') IS NULL
    ALTER TABLE dbo.NhaHang ADD MoTa NVARCHAR(500) NULL;
GO

IF COL_LENGTH(N'dbo.NhaHang', N'PhiGiaoHang') IS NULL
    ALTER TABLE dbo.NhaHang
        ADD PhiGiaoHang DECIMAL(18, 2) NOT NULL
            CONSTRAINT DF_NhaHang_PhiGiaoHang DEFAULT (15000) WITH VALUES;
GO

IF COL_LENGTH(N'dbo.MonAn', N'MoTa') IS NULL
    ALTER TABLE dbo.MonAn ADD MoTa NVARCHAR(500) NULL;
GO

IF COL_LENGTH(N'dbo.DonHang', N'TenNguoiNhan') IS NULL
    ALTER TABLE dbo.DonHang ADD TenNguoiNhan NVARCHAR(150) NULL;
GO

IF COL_LENGTH(N'dbo.DonHang', N'SoDienThoaiGiaoHang') IS NULL
    ALTER TABLE dbo.DonHang ADD SoDienThoaiGiaoHang VARCHAR(15) NULL;
GO

IF COL_LENGTH(N'dbo.DonHang', N'DiaChiGiaoHang') IS NULL
    ALTER TABLE dbo.DonHang ADD DiaChiGiaoHang NVARCHAR(300) NULL;
GO

IF COL_LENGTH(N'dbo.DonHang', N'GhiChu') IS NULL
    ALTER TABLE dbo.DonHang ADD GhiChu NVARCHAR(500) NULL;
GO

IF COL_LENGTH(N'dbo.DonHang', N'PhuongThucThanhToan') IS NULL
    ALTER TABLE dbo.DonHang
        ADD PhuongThucThanhToan VARCHAR(10) NOT NULL
            CONSTRAINT DF_DonHang_PhuongThucThanhToan DEFAULT ('COD') WITH VALUES;
GO

IF COL_LENGTH(N'dbo.DonHang', N'TienMon') IS NULL
    ALTER TABLE dbo.DonHang
        ADD TienMon DECIMAL(18, 2) NOT NULL
            CONSTRAINT DF_DonHang_TienMon DEFAULT (0) WITH VALUES;
GO

IF COL_LENGTH(N'dbo.DonHang', N'PhiGiaoHang') IS NULL
    ALTER TABLE dbo.DonHang
        ADD PhiGiaoHang DECIMAL(18, 2) NOT NULL
            CONSTRAINT DF_DonHang_PhiGiaoHang DEFAULT (0) WITH VALUES;
GO

UPDATE dh
SET
    TenNguoiNhan = COALESCE(dh.TenNguoiNhan, kh.TenKhachHang),
    SoDienThoaiGiaoHang = COALESCE(dh.SoDienThoaiGiaoHang, kh.SoDienThoai),
    DiaChiGiaoHang = COALESCE(dh.DiaChiGiaoHang, kh.DiaChiGiaoHang),
    TienMon = CASE WHEN dh.TienMon = 0 THEN dh.TongTien ELSE dh.TienMon END
FROM dbo.DonHang AS dh
INNER JOIN dbo.KhachHang AS kh ON kh.MaKhachHang = dh.MaKhachHang
WHERE
    dh.TenNguoiNhan IS NULL
    OR dh.SoDienThoaiGiaoHang IS NULL
    OR dh.DiaChiGiaoHang IS NULL
    OR (dh.TienMon = 0 AND dh.TongTien <> 0);
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
        CONSTRAINT CK_LichSuTrangThaiDonHang_TrangThai
            CHECK (TrangThai IN
            (
                N'Cho xac nhan',
                N'Da xac nhan',
                N'Dang xu ly',
                N'Da hoan thanh',
                N'Da huy'
            ))
    );

    CREATE INDEX IX_LichSuTrangThaiDonHang_MaDon_ThoiDiem
        ON dbo.LichSuTrangThaiDonHang(MaDon, ThoiDiem, MaLichSu);
END;
GO

INSERT INTO dbo.LichSuTrangThaiDonHang (MaDon, TrangThai, ThoiDiem)
SELECT dh.MaDon, dh.TrangThai, dh.NgayDat
FROM dbo.DonHang AS dh
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.LichSuTrangThaiDonHang AS ls
    WHERE ls.MaDon = dh.MaDon
);
GO

CREATE OR ALTER TRIGGER dbo.trg_CapNhatTongTienDonHang
ON dbo.ChiTietDonHang
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH DonBiAnhHuong AS
    (
        SELECT MaDon FROM inserted
        UNION
        SELECT MaDon FROM deleted
    ),
    TongMon AS
    (
        SELECT
            d.MaDon,
            COALESCE(SUM(ct.ThanhTien), 0) AS TienMon
        FROM DonBiAnhHuong AS d
        LEFT JOIN dbo.ChiTietDonHang AS ct ON ct.MaDon = d.MaDon
        GROUP BY d.MaDon
    )
    UPDATE dh
    SET
        TienMon = tm.TienMon,
        TongTien = tm.TienMon + dh.PhiGiaoHang
    FROM dbo.DonHang AS dh
    INNER JOIN TongMon AS tm ON tm.MaDon = dh.MaDon;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_KiemTraChuyenTrangThaiDonHang
ON dbo.DonHang
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM inserted AS i
        INNER JOIN deleted AS d ON d.MaDon = i.MaDon
        WHERE i.TrangThai <> d.TrangThai
          AND NOT
          (
              (d.TrangThai = N'Cho xac nhan' AND i.TrangThai IN (N'Da xac nhan', N'Da huy'))
              OR (d.TrangThai = N'Da xac nhan' AND i.TrangThai IN (N'Dang xu ly', N'Da huy'))
              OR (d.TrangThai = N'Dang xu ly' AND i.TrangThai = N'Da hoan thanh')
          )
    )
        THROW 50020, N'Chuyen trang thai don hang khong hop le.', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_LuuLichSuTrangThaiDonHang
ON dbo.DonHang
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.LichSuTrangThaiDonHang (MaDon, TrangThai)
    SELECT i.MaDon, i.TrangThai
    FROM inserted AS i
    LEFT JOIN deleted AS d ON d.MaDon = i.MaDon
    WHERE d.MaDon IS NULL OR d.TrangThai <> i.TrangThai;
END;
GO
