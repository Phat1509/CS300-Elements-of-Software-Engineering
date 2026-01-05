import React, { useEffect, useMemo, useState } from "react";
// Đảm bảo import đúng đường dẫn
import adminApi, { getAllProducts } from "../../utilities/adminApi"; 
import ProductForm from "./ProductForm";
import AdminLayout from "./AdminLayout";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  // Modal State
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  // 1. Load Data
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getAllProducts()
      .then((p) => {
        if (mounted) setProducts(Array.isArray(p) ? p : []);
      })
      .catch((err) => {
        console.error("Load products failed:", err);
        if (mounted) setProducts([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Normalize Data (QUAN TRỌNG: Xác định đúng ID)
  const normalized = useMemo(() => {
    return products.map((p) => {
      // JSON-Server thường dùng 'id'. Database thật thường dùng 'product_id'.
      // Ta ưu tiên lấy giá trị nào tồn tại.
      const realId = p.id || p.product_id || p.productId;

      return {
        ...p, // Giữ lại toàn bộ field gốc để Form dùng
        _id: realId, 
        _name: (p.name || "").toString(),
        _price: Number(p.price) || 0,
        _active: typeof p.is_active === "boolean" ? p.is_active : (p.isActive === true || p.isActive === "true"),
        _image: p.image_url || p.image || "",
      };
    });
  }, [products]);

  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalized
      .filter((p) => (onlyActive ? p._active : true))
      .filter((p) => (q ? p._name.toLowerCase().includes(q) : true))
      // Sort: ID lớn nhất lên đầu (Mới nhất)
      .sort((a, b) => Number(b._id) - Number(a._id));
  }, [normalized, query, onlyActive]);

  // 3. SỬA LỖI DELETE
  const handleDelete = async (id) => {
    if (!id) {
      alert("Lỗi: Không tìm thấy ID sản phẩm.");
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm ID: ${id}?`)) return;

    try {
      console.log("Deleting product with ID:", id); // Debug xem ID đúng chưa
      
      // Gọi API xóa
      const res = await adminApi.deleteProduct(id);

      // Nếu adminApi dùng safeJson (trả về null khi lỗi), ta phải check res
      // Lưu ý: Đôi khi API trả về rỗng (204 No Content) cũng là thành công.
      // Nhưng nếu safeJson nuốt lỗi thì res sẽ là null.
      
      // Cách fix an toàn nhất: Nếu API không throw lỗi thì coi như thành công
      // Hoặc check lại danh sách từ server để chắc chắn (an toàn nhưng chậm hơn)
      
      // Xóa khỏi UI
      setProducts((prev) => prev.filter((x) => {
        const xId = x.id || x.product_id || x.productId;
        // So sánh lỏng (==) phòng trường hợp string vs number
        return xId != id;
      }));

      alert("Đã xóa thành công!");

    } catch (e) {
      console.error("Delete error:", e);
      alert("Xóa thất bại. Vui lòng kiểm tra Console.");
    }
  };

  // 4. SỬA LỖI EDIT
  const handleSaved = (savedItem) => {
    if (!savedItem) return;
    
    // Tìm ID để cập nhật State
    const savedId = savedItem.id || savedItem.product_id || savedItem.productId;

    setProducts((prev) => {
      const exists = prev.find((x) => (x.id || x.product_id || x.productId) == savedId);
      
      if (exists) {
        // Update
        return prev.map((x) =>
          (x.id || x.product_id || x.productId) == savedId ? { ...x, ...savedItem } : x
        );
      }
      // Create
      return [savedItem, ...prev];
    });

    closeForm();
  };

  const openNew = () => {
    console.log("Opening New Form");
    setEditing(null);
    setShowNew(true);
  };

  const openEdit = (p) => {
    console.log("Opening Edit Form for:", p);
    // Quan trọng: Tắt showNew trước khi setEditing để tránh xung đột
    setShowNew(false);
    setEditing(p);
  };

  const closeForm = () => {
    setShowNew(false);
    setEditing(null);
  };

  return (
    <AdminLayout title="Product Management">
      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <input
            className="input"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="admin-switch" style={{ marginLeft: 15 }}>
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
            />
            <span>Active Only</span>
          </label>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          + Add Product
        </button>
      </div>

      {/* Form Modal / Panel */}
      {/* Thêm điều kiện render rõ ràng hơn */}
      {(showNew || editing) && (
        <div className="admin-panel" style={{ border: "2px solid #007bff", marginBottom: 20 }}>
          <div className="admin-panel-top">
            <div>
              <strong>{showNew ? "Create New Product" : `Edit Product: ${editing?._name}`}</strong>
            </div>
            <button className="btn btn-sm btn-outline" onClick={closeForm}>
              Close
            </button>
          </div>
          
          {/* Truyền key để React reset form khi đổi sản phẩm */}
          <ProductForm
            key={editing ? editing._id : 'new'}
            initial={showNew ? null : editing}
            onSaved={handleSaved}
            onCancel={closeForm}
          />
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className="muted" style={{ padding: 20 }}>Loading...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Img</th>
                <th>Product Name</th>
                <th style={{ width: 120 }}>Price</th>
                <th style={{ width: 100 }}>Status</th>
                <th style={{ width: 160, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4 muted">
                    No products found.
                  </td>
                </tr>
              ) : (
                displayed.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="admin-img">
                        {p._image ? (
                          <img src={p._image} alt="" onError={(e) => e.target.style.display='none'} />
                        ) : (
                          <span className="muted">No img</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p._name}</div>
                      <div className="muted small">ID: {p._id}</div>
                    </td>
                    <td>{Number(p._price).toLocaleString()}₫</td>
                    <td>
                      <span className={`pill ${p._active ? "pill-green" : "pill-gray"}`}>
                        {p._active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button 
                        className="btn-icon" 
                        onClick={() => openEdit(p)} 
                        title="Edit"
                        style={{cursor: 'pointer'}} // Thêm style để chắc chắn click được
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon delete" 
                        onClick={() => handleDelete(p._id)} 
                        title="Delete"
                        style={{ marginLeft: 8, color: "red", cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}