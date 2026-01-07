import React, { useEffect, useMemo, useState } from "react";
import adminApi, { getAllProducts } from "../../utilities/adminApi";
import ProductForm from "./ProductForm";
import AdminLayout from "./AdminLayout";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  // Modal/Form states
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  // 1. Tải dữ liệu ban đầu
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getAllProducts()
      .then((data) => {
        // adminApi đã xử lý bóc tách data, ở đây nhận về mảng products chuẩn
        if (mounted) setProducts(Array.isArray(data) ? data : []);
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

  // 2. Chuẩn hóa dữ liệu (Mapping Rust Struct -> UI)
  const normalized = useMemo(() => {
    return products.map((p) => {
      return {
        ...p, 
        // Mapping các field từ Rust cho dễ dùng trong UI
        _id: p.id, 
        _name: p.name || "",
        _price: Number(p.price) || 0,
        _active: p.is_active,     // Rust trả về bool chuẩn
        _image: p.image_url || "", // Rust trả về snake_case image_url
        _desc: p.description || ""
      };
    });
  }, [products]);

  // 3. Lọc và Sắp xếp (Client-side)
  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalized
      .filter((p) => (onlyActive ? p._active : true))
      .filter((p) => (q ? p._name.toLowerCase().includes(q) : true))
      .sort((a, b) => b._id - a._id); // Mới nhất lên đầu
  }, [normalized, query, onlyActive]);

  // 4. Xử lý Xóa
  const handleDelete = async (id) => {
    if (!id) return;

    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm ID: ${id}?`)) return;

    try {
      await adminApi.deleteProduct(id);

      // Cập nhật lại UI sau khi xóa thành công
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("Đã xóa thành công!");

    } catch (e) {
      console.error("Delete error:", e);
      alert("Xóa thất bại: " + e.message);
    }
  };

  // 5. Xử lý sau khi Lưu (Create/Update) thành công
  const handleSaved = (savedItem) => {
    if (!savedItem) return;
    
    setProducts((prev) => {
      const exists = prev.find((p) => p.id === savedItem.id);
      
      if (exists) {
        // Update: thay thế item cũ
        return prev.map((p) => (p.id === savedItem.id ? savedItem : p));
      }
      // Create: thêm vào đầu danh sách
      return [savedItem, ...prev];
    });

    closeForm();
  };

  const openNew = () => {
    setEditing(null);
    setShowNew(true);
  };

  const openEdit = (p) => {
    setShowNew(false);
    // Truyền đúng object gốc vào form
    setEditing(p);
  };

  const closeForm = () => {
    setShowNew(false);
    setEditing(null);
  };

  return (
    <AdminLayout title="Quản lý Sản phẩm">
      {/* Toolbar: Tìm kiếm & Nút thêm */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <input
            className="input"
            placeholder="Tìm theo tên..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="admin-switch" style={{ marginLeft: 15 }}>
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
            />
            <span style={{ marginLeft: 8 }}>Chỉ hiện Đang bán</span>
          </label>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          + Thêm Sản phẩm
        </button>
      </div>

      {/* Form Area (Create/Edit) */}
      {(showNew || editing) && (
        <div className="admin-panel" style={{ border: "2px solid #007bff", marginBottom: 20 }}>
          <div className="admin-panel-top">
            <div>
              <strong>{showNew ? "Thêm Sản phẩm Mới" : `Sửa sản phẩm: ${editing?._name}`}</strong>
            </div>
            <button className="btn btn-sm btn-outline" onClick={closeForm}>
              Đóng
            </button>
          </div>
          
          <ProductForm
            key={editing ? editing.id : 'new'}
            initial={showNew ? null : editing}
            onSaved={handleSaved}
            onCancel={closeForm}
          />
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className="muted" style={{ padding: 20 }}>Đang tải dữ liệu...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th style={{ width: 120 }}>Giá</th>
                <th style={{ width: 100 }}>Trạng thái</th>
                <th style={{ width: 120, textAlign: "right" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4 muted">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              ) : (
                displayed.map((p) => (
                  <tr key={p._id}>
                    {/* Cột ảnh */}
                    <td>
                      <div className="admin-img">
                        {p._image ? (
                          <img 
                            src={p._image} 
                            alt="" 
                            onError={(e) => e.target.style.display='none'} 
                          />
                        ) : (
                          <span className="muted small">No img</span>
                        )}
                      </div>
                    </td>

                    {/* Cột Tên */}
                    <td>
                      <div style={{ fontWeight: 600 }}>{p._name}</div>
                      <div className="muted small">ID: {p._id}</div>
                    </td>

                    {/* Cột Giá */}
                    <td>{p._price.toLocaleString('vi-VN')}₫</td>

                    {/* Cột Trạng thái */}
                    <td>
                      <span className={`pill ${p._active ? "pill-green" : "pill-gray"}`}>
                        {p._active ? "Active" : "Hidden"}
                      </span>
                    </td>

                    {/* Cột Hành động */}
                    <td style={{ textAlign: "right" }}>
                      <button 
                        className="btn-icon" 
                        onClick={() => openEdit(p)} 
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon delete" 
                        onClick={() => handleDelete(p._id)} 
                        title="Xóa"
                        style={{ marginLeft: 8, color: "red" }}
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