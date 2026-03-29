import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/users";

function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      setMessage("Không tải được danh sách user");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      phone: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Có lỗi xảy ra");
      }

      setMessage(editingId ? "Cập nhật user thành công" : "Tạo user thành công");
      resetForm();
      loadUsers();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Xóa user thất bại");
      }

      setMessage("Xóa user thành công");
      if (editingId === id) {
        resetForm();
      }
      loadUsers();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto", fontFamily: "Arial" }}>
      <h1>Test CRUD User</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            name="fullName"
            placeholder="Họ tên"
            value={form.fullName}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            name="phone"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        <button type="submit" style={{ marginRight: "10px", padding: "10px 16px" }}>
          {editingId ? "Cập nhật" : "Tạo mới"}
        </button>

        <button type="button" onClick={resetForm} style={{ padding: "10px 16px" }}>
          Reset
        </button>
      </form>

      {message && <p>{message}</p>}

      <h2>Danh sách user</h2>

      {users.length === 0 ? (
        <p>Chưa có user nào</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <button onClick={() => handleEdit(user)} style={{ marginRight: "8px" }}>
                    Sửa
                  </button>
                  <button onClick={() => handleDelete(user.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;