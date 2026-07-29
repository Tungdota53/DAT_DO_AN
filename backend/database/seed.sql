USE [DatDoAnOnline];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

/*
  Development catalog data only. No customer or order data is created here.
  Existing rows are enriched by stable development IDs; missing catalogs are
  inserted without deleting or replacing user data.
*/

IF NOT EXISTS (SELECT 1 FROM dbo.LoaiMon)
BEGIN
    INSERT INTO dbo.LoaiMon (TenLoaiMon)
    VALUES (N'Món chính'), (N'Khai vị'), (N'Đồ uống');
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.NhaHang)
BEGIN
    INSERT INTO dbo.NhaHang
        (TenNhaHang, DiaChi, SoDienThoai, MoTa, PhiGiaoHang)
    VALUES
        (N'Bếp Việt', N'12 Nguyễn Trãi, Quận 1', '0901000001',
         N'Cơm nhà Việt Nam nấu mới mỗi ngày.', 15000),
        (N'Pizza House', N'25 Lê Lợi, Quận 1', '0901000002',
         N'Pizza thủ công với đế bánh nướng giòn.', 20000),
        (N'Quán Ăn Sáng', N'80 Trần Hưng Đạo, Quận 5', '0901000003',
         N'Bữa sáng Việt nhanh gọn và đủ chất.', 12000);
END;
GO

UPDATE dbo.NhaHang
SET
    TenNhaHang = CASE MaNhaHang
        WHEN 1 THEN N'Bếp Việt'
        WHEN 2 THEN N'Pizza House'
        WHEN 3 THEN N'Quán Ăn Sáng'
        ELSE TenNhaHang
    END,
    DiaChi = CASE MaNhaHang
        WHEN 1 THEN N'12 Nguyễn Trãi, Quận 1'
        WHEN 2 THEN N'25 Lê Lợi, Quận 1'
        WHEN 3 THEN N'80 Trần Hưng Đạo, Quận 5'
        ELSE DiaChi
    END,
    MoTa = CASE MaNhaHang
        WHEN 1 THEN N'Cơm nhà Việt Nam nấu mới mỗi ngày.'
        WHEN 2 THEN N'Pizza thủ công với đế bánh nướng giòn.'
        WHEN 3 THEN N'Bữa sáng Việt nhanh gọn và đủ chất.'
        ELSE MoTa
    END,
    PhiGiaoHang = CASE MaNhaHang
        WHEN 1 THEN 15000
        WHEN 2 THEN 20000
        WHEN 3 THEN 12000
        ELSE PhiGiaoHang
    END
WHERE MaNhaHang IN (1, 2, 3);
GO

UPDATE dbo.LoaiMon
SET TenLoaiMon = CASE MaLoaiMon
    WHEN 1 THEN N'Món chính'
    WHEN 2 THEN N'Khai vị'
    WHEN 3 THEN N'Đồ uống'
    ELSE TenLoaiMon
END
WHERE MaLoaiMon IN (1, 2, 3);
GO

UPDATE dbo.MonAn
SET
    TenMon = CASE MaMon
        WHEN 1 THEN N'Cơm gà'
        WHEN 2 THEN N'Gỏi cuốn'
        WHEN 3 THEN N'Phở bò'
        WHEN 4 THEN N'Pizza hải sản'
        WHEN 5 THEN N'Salad cá ngừ'
        WHEN 6 THEN N'Bánh mì ốp la'
        WHEN 7 THEN N'Cà phê sữa'
        ELSE TenMon
    END,
    MoTa = CASE MaMon
        WHEN 1 THEN N'Cơm dẻo, gà áp chảo và rau theo mùa.'
        WHEN 2 THEN N'Tôm, thịt, bún và rau cuốn tươi.'
        WHEN 3 THEN N'Nước dùng hầm xương, thịt bò và bánh phở.'
        WHEN 4 THEN N'Hải sản, phô mai và sốt cà chua nhà làm.'
        WHEN 5 THEN N'Rau xanh, cá ngừ và sốt mè rang.'
        WHEN 6 THEN N'Bánh mì giòn, trứng ốp la và rau.'
        WHEN 7 THEN N'Cà phê rang đậm pha cùng sữa đặc.'
        ELSE MoTa
    END
WHERE MaMon IN (1, 2, 3, 4, 5, 6, 7);
GO
