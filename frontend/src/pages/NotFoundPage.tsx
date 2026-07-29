import { EmptyState } from "../components/common/ResourceStates";
import { Link } from "../routes/router";

export function NotFoundPage() {
  return (
    <section className="page-section">
      <EmptyState
        title="Trang không tồn tại"
        message="Đường dẫn bạn mở không thuộc FoodGo MVP."
        action={
          <Link to="/" className="primary-button">
            Về trang chủ
          </Link>
        }
      />
    </section>
  );
}
