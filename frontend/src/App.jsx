import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "/api/products/";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  stock: "",
};

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [form, setForm] = useState(emptyForm);

  /* =========================
     FETCH PRODUCTS
  ========================= */

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to connect to the Django API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =========================
     NOTIFICATION
  ========================= */

  const showNotification = (message, type = "success") => {
    setNotification({
      message,
      type,
    });

    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  /* =========================
     STATISTICS
  ========================= */

  const totalProducts = products.length;

  const totalStock = useMemo(() => {
    return products.reduce(
      (total, product) => total + Number(product.stock || 0),
      0,
    );
  }, [products]);

  const lowStock = useMemo(() => {
    return products.filter((product) => Number(product.stock) <= 10).length;
  }, [products]);

  const inventoryValue = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total +
        Number(product.price || 0) * Number(product.stock || 0),
      0,
    );
  }, [products]);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean),
      ),
    ];

    return uniqueCategories.sort();
  }, [products]);

  /* =========================
     FILTER PRODUCTS
  ========================= */

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        product.name?.toLowerCase().includes(searchText) ||
        product.category?.toLowerCase().includes(searchText) ||
        product.description?.toLowerCase().includes(searchText);

      const matchesCategory =
        categoryFilter === "All" ||
        product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  /* =========================
     FORM HANDLING
  ========================= */

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      price: product.price || "",
      stock: product.stock ?? "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  /* =========================
     ADD / EDIT PRODUCT
  ========================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      showNotification("Product name is required.", "error");
      return;
    }

    if (!form.category.trim()) {
      showNotification("Category is required.", "error");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      showNotification("Enter a valid product price.", "error");
      return;
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      showNotification("Enter a valid stock quantity.", "error");
      return;
    }

    const productData = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: form.price,
      stock: Number(form.stock),
    };

    try {
      setSaving(true);

      const url = editingProduct
        ? `${API_URL}${editingProduct.id}/`
        : API_URL;

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const responseData = await response.json().catch(() => null);

        console.error("Save error:", responseData);

        throw new Error("Unable to save product.");
      }

      const savedProduct = await response.json();

      if (editingProduct) {
        setProducts((previous) =>
          previous.map((product) =>
            product.id === savedProduct.id
              ? savedProduct
              : product,
          ),
        );

        showNotification("Product updated successfully.");
      } else {
        setProducts((previous) => [
          savedProduct,
          ...previous,
        ]);

        showNotification("Product added successfully.");
      }

      closeModal();
    } catch (err) {
      console.error(err);
      showNotification(
        "Something went wrong while saving the product.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     DELETE PRODUCT
  ========================= */

  const openDeleteModal = (product) => {
    setDeletingProduct(product);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeletingProduct(null);
    setDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}${deletingProduct.id}/`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Delete request failed.");
      }

      setProducts((previous) =>
        previous.filter(
          (product) => product.id !== deletingProduct.id,
        ),
      );

      showNotification("Product deleted successfully.");

      closeDeleteModal();
    } catch (err) {
      console.error(err);

      showNotification(
        "Unable to delete the product.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     HELPERS
  ========================= */

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStockStatus = (stock) => {
    const value = Number(stock);

    if (value === 0) {
      return {
        label: "Out of stock",
        className: "stock-danger",
      };
    }

    if (value <= 10) {
      return {
        label: "Low stock",
        className: "stock-warning",
      };
    }

    return {
      label: "In stock",
      className: "stock-success",
    };
  };

  /* =========================
     SIDEBAR
  ========================= */

  const navigation = [
    {
      label: "Dashboard",
      icon: "⌂",
    },
    {
      label: "Products",
      icon: "▦",
    },
    {
      label: "Categories",
      icon: "◈",
    },
    {
      label: "Orders",
      icon: "◫",
    },
    {
      label: "Analytics",
      icon: "◒",
    },
    {
      label: "Settings",
      icon: "⚙",
    },
  ];

  const handleNavigation = (page) => {
    setActivePage(page);

    if (page === "Products") {
      setTimeout(() => {
        document
          .getElementById("products-section")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 50);
    }
  };

  /* =========================
     DASHBOARD
  ========================= */

  const DashboardView = () => (
    <>
      <section className="hero-section">
        <div>
          <div className="eyebrow">
            <span className="status-dot"></span>
            SYSTEM OPERATIONAL
          </div>

          <h1>
            Manage your
            <span> inventory.</span>
          </h1>

          <p>
            Keep your products, stock and inventory data
            organized from one powerful workspace.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={openAddModal}
            >
              <span>＋</span>
              Add Product
            </button>

            <button
              className="secondary-button"
              onClick={fetchProducts}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        <div className="hero-decoration">
          <div className="orb orb-one"></div>
          <div className="orb orb-two"></div>

          <div className="hero-card">
            <span>Inventory Value</span>
            <strong>{formatCurrency(inventoryValue)}</strong>
            <small>Live database value</small>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">▦</div>
          <div>
            <span>Total Products</span>
            <strong>{totalProducts}</strong>
            <small>Products in database</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">◫</div>
          <div>
            <span>Total Stock</span>
            <strong>{totalStock}</strong>
            <small>Units available</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">!</div>
          <div>
            <span>Low Stock</span>
            <strong>{lowStock}</strong>
            <small>Need attention</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">₹</div>
          <div>
            <span>Inventory Value</span>
            <strong>{formatCurrency(inventoryValue)}</strong>
            <small>Current stock value</small>
          </div>
        </div>
      </section>

      <section
        className="content-grid"
        id="products-section"
      >
        <div className="panel products-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">INVENTORY</span>
              <h2>Recent Products</h2>
            </div>

            <button
              className="text-button"
              onClick={() => handleNavigation("Products")}
            >
              View all →
            </button>
          </div>

          <ProductTable limit={5} />
        </div>

        <div className="panel activity-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">SYSTEM</span>
              <h2>Activity</h2>
            </div>
          </div>

          <div className="activity-list">
            {products.slice(0, 5).map((product) => (
              <div
                className="activity-item"
                key={product.id}
              >
                <div className="activity-icon">
                  +
                </div>

                <div>
                  <strong>{product.name}</strong>
                  <p>
                    Product available in inventory
                  </p>
                  <span>
                    {formatDate(product.created_at)}
                  </span>
                </div>
              </div>
            ))}

            {products.length === 0 && !loading && (
              <div className="empty-activity">
                No recent activity.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );

  /* =========================
     PRODUCT TABLE
  ========================= */

  const ProductTable = ({ limit = null }) => {
    const displayedProducts = limit
      ? filteredProducts.slice(0, limit)
      : filteredProducts;

    if (loading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state">
          <div className="error-icon">!</div>
          <h3>Connection failed</h3>
          <p>{error}</p>
          <button
            className="secondary-button"
            onClick={fetchProducts}
          >
            Try again
          </button>
        </div>
      );
    }

    if (displayedProducts.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">▦</div>
          <h3>No products found</h3>
          <p>
            Add a product or change your search/filter.
          </p>

          <button
            className="primary-button"
            onClick={openAddModal}
          >
            ＋ Add Product
          </button>
        </div>
      );
    }

    return (
      <div className="table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>CATEGORY</th>
              <th>PRICE</th>
              <th>STOCK</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {displayedProducts.map((product) => {
              const status = getStockStatus(
                product.stock,
              );

              return (
                <tr key={product.id}>
                  <td>
                    <div className="product-info">
                      <div className="product-avatar">
                        {product.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>{product.name}</strong>

                        <span>
                          {product.description ||
                            "No description"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="category-badge">
                      {product.category}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {formatCurrency(
                        Number(product.price),
                      )}
                    </strong>
                  </td>

                  <td>
                    <span className="stock-number">
                      {product.stock}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`stock-badge ${status.className}`}
                    >
                      <span></span>
                      {status.label}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-button edit"
                        title="Edit product"
                        onClick={() =>
                          openEditModal(product)
                        }
                      >
                        ✎
                      </button>

                      <button
                        className="icon-button delete"
                        title="Delete product"
                        onClick={() =>
                          openDeleteModal(product)
                        }
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  /* =========================
     PRODUCTS PAGE
  ========================= */

  const ProductsView = () => (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <span className="panel-label">
            INVENTORY MANAGEMENT
          </span>

          <h1>Products</h1>

          <p>
            Create, update, search and manage your
            complete product inventory.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          ＋ Add Product
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="clear-search"
            >
              ×
            </button>
          )}
        </div>

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(event.target.value)
          }
        >
          <option value="All">All categories</option>

          {categories.map((category) => (
            <option
              value={category}
              key={category}
            >
              {category}
            </option>
          ))}
        </select>

        <button
          className="secondary-button"
          onClick={fetchProducts}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="panel full-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              PRODUCTS
            </span>

            <h2>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "Product"
                : "Products"}
            </h2>
          </div>

          <div className="result-info">
            {search || categoryFilter !== "All"
              ? "Filtered results"
              : "All inventory"}
          </div>
        </div>

        <ProductTable />
      </div>
    </section>
  );

  /* =========================
     OTHER PAGES
  ========================= */

  const CategoriesView = () => (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <span className="panel-label">
            CATALOG
          </span>
          <h1>Categories</h1>
          <p>
            Overview of categories currently used by
            your products.
          </p>
        </div>
      </div>

      <div className="category-grid">
        {categories.length === 0 ? (
          <div className="panel empty-state">
            <div className="empty-icon">◈</div>
            <h3>No categories yet</h3>
            <p>
              Add products with categories to see them
              here.
            </p>
          </div>
        ) : (
          categories.map((category) => {
            const categoryProducts =
              products.filter(
                (product) =>
                  product.category === category,
              );

            const value = categoryProducts.reduce(
              (total, product) =>
                total +
                Number(product.price) *
                  Number(product.stock),
              0,
            );

            return (
              <div
                className="category-card"
                key={category}
              >
                <div className="category-card-icon">
                  ◈
                </div>

                <div>
                  <h3>{category}</h3>

                  <p>
                    {categoryProducts.length}{" "}
                    {categoryProducts.length === 1
                      ? "product"
                      : "products"}
                  </p>

                  <strong>
                    {formatCurrency(value)}
                  </strong>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );

  const OrdersView = () => (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <span className="panel-label">
            COMMERCE
          </span>

          <h1>Orders</h1>

          <p>
            Order management will connect to the
            Django order API when the order module is
            added.
          </p>
        </div>
      </div>

      <div className="panel coming-soon">
        <div className="coming-icon">◫</div>
        <h2>Order module</h2>
        <p>
          The product inventory API is active. The
          order module will be connected as a separate
          Django resource.
        </p>
      </div>
    </section>
  );

  const AnalyticsView = () => (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <span className="panel-label">
            BUSINESS INSIGHTS
          </span>

          <h1>Analytics</h1>

          <p>
            Live calculations based on your current
            inventory.
          </p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <span>Total products</span>
          <strong>{totalProducts}</strong>
        </div>

        <div className="analytics-card">
          <span>Total units</span>
          <strong>{totalStock}</strong>
        </div>

        <div className="analytics-card">
          <span>Low-stock products</span>
          <strong>{lowStock}</strong>
        </div>

        <div className="analytics-card">
          <span>Inventory value</span>
          <strong>
            {formatCurrency(inventoryValue)}
          </strong>
        </div>
      </div>

      <div className="panel analytics-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              CATEGORY DISTRIBUTION
            </span>

            <h2>Inventory by category</h2>
          </div>
        </div>

        <div className="bar-list">
          {categories.map((category) => {
            const count = products.filter(
              (product) =>
                product.category === category,
            ).length;

            const percentage =
              totalProducts > 0
                ? (count / totalProducts) * 100
                : 0;

            return (
              <div
                className="bar-item"
                key={category}
              >
                <div className="bar-meta">
                  <span>{category}</span>
                  <strong>{count}</strong>
                </div>

                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${percentage}%`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

  const SettingsView = () => (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <span className="panel-label">
            WORKSPACE
          </span>

          <h1>Settings</h1>

          <p>
            DevStore application information and
            connection status.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="panel settings-card">
          <span className="settings-icon">◉</span>

          <div>
            <h3>API Connection</h3>

            <p>
              Django REST API
            </p>

            <strong className="connection-status">
              ● Connected
            </strong>
          </div>
        </div>

        <div className="panel settings-card">
          <span className="settings-icon">▦</span>

          <div>
            <h3>Database</h3>

            <p>
              Current local development database
            </p>

            <strong>
              Django Database
            </strong>
          </div>
        </div>
      </div>
    </section>
  );

  /* =========================
     PAGE ROUTER
  ========================= */

  const renderPage = () => {
    switch (activePage) {
      case "Products":
        return <ProductsView />;

      case "Categories":
        return <CategoriesView />;

      case "Orders":
        return <OrdersView />;

      case "Analytics":
        return <AnalyticsView />;

      case "Settings":
        return <SettingsView />;

      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-shell">
      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            D
          </div>

          <div>
            <strong>DevStore</strong>
            <span>Inventory Platform</span>
          </div>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-title">
            WORKSPACE
          </span>

          <nav>
            {navigation.map((item) => (
              <button
                key={item.label}
                className={`nav-item ${
                  activePage === item.label
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleNavigation(item.label)
                }
              >
                <span className="nav-icon">
                  {item.icon}
                </span>

                <span>{item.label}</span>

                {activePage === item.label && (
                  <span className="nav-active-dot"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="backend-status">
            <span className="status-dot"></span>

            <div>
              <strong>Backend online</strong>
              <span>Django API</span>
            </div>
          </div>

          <div className="user-card">
            <div className="user-avatar">
              MS
            </div>

            <div>
              <strong>Administrator</strong>
              <span>DevStore Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================
          MAIN
      ========================= */}

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>DevStore</span>
            <b>/</b>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <button
              className="topbar-button"
              title="Refresh data"
              onClick={fetchProducts}
            >
              ↻
            </button>

            <div className="topbar-user">
              <div className="mini-avatar">
                MS
              </div>

              <div>
                <strong>Admin</strong>
                <span>Workspace</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-container">
          {renderPage()}
        </div>

        <footer className="footer">
          <span>
            © 2026 DevStore
          </span>

          <span>
            React · Django REST · Database
          </span>
        </footer>
      </main>

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {modalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={closeModal}
        >
          <div
            className="modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <span className="panel-label">
                  PRODUCT MANAGEMENT
                </span>

                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p>
                  {editingProduct
                    ? "Update product information."
                    : "Create a new inventory product."}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form
              className="product-form"
              onSubmit={handleSubmit}
            >
              <div className="form-grid">
                <div className="form-group full">
                  <label>
                    Product Name
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Gaming Laptop"
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>
                    Category
                  </label>

                  <input
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    placeholder="e.g. Laptop"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Price (INR)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="75000"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={form.stock}
                    onChange={handleInputChange}
                    placeholder="10"
                  />
                </div>

                <div className="form-group full">
                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Describe the product..."
                    rows="4"
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingProduct
                        ? "Save Changes"
                        : "Create Product"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          DELETE MODAL
      ========================= */}

      {deleteModalOpen && deletingProduct && (
        <div
          className="modal-overlay"
          onMouseDown={closeDeleteModal}
        >
          <div
            className="delete-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="delete-icon">
              !
            </div>

            <h2>Delete product?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>
                {deletingProduct.name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="delete-actions">
              <button
                className="secondary-button"
                onClick={closeDeleteModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="danger-button"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving
                  ? "Deleting..."
                  : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          NOTIFICATION
      ========================= */}

      {notification && (
        <div
          className={`notification ${
            notification.type === "error"
              ? "notification-error"
              : "notification-success"
          }`}
        >
          <span className="notification-icon">
            {notification.type === "error"
              ? "!"
              : "✓"}
          </span>

          <span>{notification.message}</span>

          <button
            onClick={() =>
              setNotification(null)
            }
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;