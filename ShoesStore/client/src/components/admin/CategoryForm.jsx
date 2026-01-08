import React, { useState, useEffect } from "react";
import adminApi from "../../utilities/adminApi";
// 1. Import các component cần thiết
import ConfirmModal from "../common/ConfirmModal";
import useNotice from "../../hooks/useNotice";
import Notice from "../common/Notice";

const generateSlug = (text) => {
  return text.toString().toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export default function CategoryForm({ initial = null, allCategories = [], onSaved, onCancel }) {
  const [form, setForm] = useState({ 
    name: "", 
    slug: "", 
    parent_id: "" 
  });
  const [saving, setSaving] = useState(false);
  
  // 2. State quản lý Modal Confirm
  const [showConfirm, setShowConfirm] = useState(false);

  // 3. Hook quản lý thông báo lỗi (nếu có lỗi khi validate form)
  const { notice, showNotice } = useNotice();

  useEffect(() => {
    if (initial) {
      setForm({ 
        name: initial.name || "", 
        slug: initial.slug || "", 
        parent_id: initial.parent_id || "" 
      });
    } else {
      setForm({ name: "", slug: "", parent_id: "" });
    }
  }, [initial]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setForm({ 
      ...form, 
      name: val, 
      slug: generateSlug(val) 
    });
  };

  // 4. Bước 1: Khi bấm nút Save -> Chỉ kiểm tra và mở Modal
  const handlePreSubmit = (e) => {
    e.preventDefault();
    
    // Validate đơn giản
    if (!form.name.trim()) {
      showNotice("error", "Category Name is required!");
      return;
    }

    // Mở Modal hỏi xác nhận
    setShowConfirm(true);
  };

  // 5. Bước 2: Hàm thực thi lưu (Được gọi khi chọn 'Save' trong Modal)
  const executeSave = async () => {
    // Đóng modal trước
    setShowConfirm(false);
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        parent_id: form.parent_id ? parseInt(form.parent_id) : null
      };

      if (initial) {
        await adminApi.updateCategory(initial.id, payload);
      } else {
        await adminApi.createCategory(payload);
      }
      
      // Gọi callback để cha (CategoriesAdmin) xử lý tiếp (load lại data, hiện thông báo thành công)
      onSaved(); 
      
    } catch (err) {
      // Nếu lỗi API thì hiện thông báo đỏ ngay tại form
      showNotice("error", "Error: " + err.message);
    } finally { 
      setSaving(false); 
    }
  };

  const parentOptions = allCategories.filter(c => initial ? c.id !== initial.id : true);

  return (
    // Đổi onSubmit thành handlePreSubmit
    <form onSubmit={handlePreSubmit} className="admin-form">
      
      {/* Hiển thị thông báo lỗi (nếu có) */}
      {notice && <Notice type={notice.type} message={notice.message} />}

      {/* 6. Chèn Confirm Modal vào đây */}
      <ConfirmModal 
        isOpen={showConfirm}
        title={initial ? "Update Category?" : "Create Category?"}
        message={`Are you sure you want to save category "${form.name}"?`}
        confirmText="Save"
        cancelText="Cancel"
        isDanger={false} // Hành động Save thường dùng màu xanh (false)
        onConfirm={executeSave}
        onCancel={() => setShowConfirm(false)}
      />

      <div className="form-group">
        <label>Category Name</label>
        <input 
          className="input" 
          value={form.name} 
          onChange={handleNameChange} 
          required 
          placeholder="Examples: Running Shoes, Accessories..."
        />
      </div>

      <div className="form-group">
        <label>Slug (Auto-generated)</label>
        <input 
          className="input" 
          value={form.slug} 
          onChange={(e) => setForm({...form, slug: e.target.value})}
          placeholder="running-shoes, accessories..."
        />
        <small className="muted">SEO-friendly URL.</small>
      </div>

      <div className="form-group">
        <label>Parent Category (Optional)</label>
        <select 
          className="input" 
          value={form.parent_id} 
          onChange={(e) => setForm({...form, parent_id: e.target.value})}
        >
          <option value="">-- Root Category --</option>
          {parentOptions.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="form-actions" style={{ marginTop: 20 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Category"}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel} style={{ marginLeft: 10 }}>
          Cancel
        </button>
      </div>
    </form>
  );
}