document.addEventListener('DOMContentLoaded', function() {
    // --- Initial Product Data (Used if localStorage is empty) ---
    const initialProducts = [
        { id: 1, name: 'Intel Core i9-13900K', description: 'Prosesor 24-core 32-thread 5.8GHz', price: 9999000, image: 'https://th.bing.com/th/id/OIP.BzL1wS1AW9Wgy3sUoqBX9AHaHa?w=188&h=188&c=7&r=0&o=5&dpr=1.1&pid=1.7' },
        { id: 2, name: 'NVIDIA RTX 4090', description: '24GB GDDR6X 384-bit', price: 32500000, image: 'https://th.bing.com/th/id/OIP.U6kN_ZgONhhUGC7OKfmMegHaEI?rs=1&pid=ImgDetMain' },
        { id: 3, name: 'NVIDIA RTX 5090', description: '32GB GDDR7 384-bit', price: 32500000, image: 'https://images.stockx.com/images/NVIDIA-GIGABYTE-GeForce-RTX-5090-AORUS-MASTER-ICE-32G-GDDR7-Graphics-Card-GV-N5090AORUSM-ICE-32GD-White.jpg?fit=fill&bg=FFFFFF&w=700&h=500&fm=webp&auto=compress&q=90&dpr=2&trim=color&updated_at=1739222725n' },
        { id: 4, name: 'NVIDIA RTX 3090', description: '24GB GDDR6X 384-bit', price: 29500000, image: 'https://nguyencongpc.vn/media/product/18831-asus-rog-strix-geforce-rtx-3090-oc-white-edition-4.jpg' },
        { id: 5, name: 'NVIDIA RTX 4070 Ti Super', description: '16GB GDDR6 384-bit', price: 26500000, image: 'https://th.bing.com/th/id/OIP.8qG8pTxVdT-n0Ck3uTurCQHaHa?rs=1&pid=ImgDetMain' }
    ];

    // --- Initialize localStorage if empty ---
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(initialProducts));
    }

    // --- Helper function to get products from localStorage ---
    const getProducts = () => JSON.parse(localStorage.getItem('products')) || [];

    // --- Helper function to save products to localStorage ---
    const saveProducts = (products) => localStorage.setItem('products', JSON.stringify(products));

    
    // --- USER-FACING PRODUCT PAGE LOGIC (`produk.html`) ---
    const productContainer = document.querySelector('.product-container');
    if (productContainer) {
        const products = getProducts();
        productContainer.innerHTML = ''; // Clear static products
        if (products.length > 0) {
            products.forEach(p => {
                const productCard = document.createElement('div');
                productCard.className = 'product';
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${p.image}" alt="${p.name}">
                    </div>
                    <h3>${p.name}</h3>
                    <p>${p.description}</p>
                    <div class="product-footer">
                        <span class="price">Rp ${p.price.toLocaleString('id-ID')}</span>
                        <button class="buy-btn">Beli</button>
                    </div>
                `;
                productContainer.appendChild(productCard);
            });
        } else {
            productContainer.innerHTML = '<p>Tidak ada produk yang tersedia saat ini.</p>';
        }
    }


    // --- ADMIN PAGE CRUD LOGIC (`admin.html`) ---
    const adminPage = document.getElementById('productTableBody');
    if (adminPage) {
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('modalTitle');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const addNewProductBtn = document.getElementById('addNewProductBtn');
        const productForm = document.getElementById('productForm');
        const productTableBody = document.getElementById('productTableBody');

        // === KODE BARU DIMULAI DI SINI ===
        const importFile = document.getElementById('importFile');
        const importBtn = document.getElementById('importBtn');
        const exportBtn = document.getElementById('exportBtn');
        
        // EXPORT FUNCTIONALITY
        const handleExport = () => {
            const products = getProducts();
            const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'barang.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('Data produk berhasil diekspor ke barang.json!');
        };

        // IMPORT FUNCTIONALITY
        const handleImport = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedProducts = JSON.parse(e.target.result);
                    if (!Array.isArray(importedProducts)) {
                       throw new Error("File JSON tidak valid. Harus berisi array produk.");
                    }
                    if (confirm('Apakah Anda yakin ingin menimpa semua produk saat ini dengan data dari file?')) {
                        saveProducts(importedProducts);
                        renderProductTable();
                        alert('Data produk berhasil diimpor!');
                    }
                } catch (error) {
                    alert('Gagal mengimpor file: ' + error.message);
                } finally {
                    importFile.value = '';
                }
            };
            reader.readAsText(file);
        };
        // === KODE BARU BERAKHIR DI SINI ===

        // Function to render products in the admin table
        const renderProductTable = () => {
            productTableBody.innerHTML = '';
            const products = getProducts();
            products.forEach(p => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${p.id}</td>
                    <td><img src="${p.image}" alt="${p.name}" width="50"></td>
                    <td>${p.name}</td>
                    <td>${p.description}</td>
                    <td>Rp ${p.price.toLocaleString('id-ID')}</td>
                    <td>
                        <div class="action-btns">
                            <button class="edit-btn" data-id="${p.id}"><i class="bi bi-pencil-square"></i> Edit</button>
                            <button class="delete-btn" data-id="${p.id}"><i class="bi bi-trash"></i> Hapus</button>
                        </div>
                    </td>
                `;
                productTableBody.appendChild(row);
            });
        };

        // Function to open the modal for adding or editing
        const openModal = (product = null) => {
            productForm.reset();
            if (product) {
                modalTitle.textContent = 'Edit Produk';
                document.getElementById('productId').value = product.id;
                document.getElementById('productName').value = product.name;
                document.getElementById('productDesc').value = product.description;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productImage').value = product.image;
            } else {
                modalTitle.textContent = 'Tambah Produk Baru';
                document.getElementById('productId').value = '';
            }
            modal.style.display = 'block';
        };

        // Function to close the modal
        const closeModal = () => {
            modal.style.display = 'none';
        };

        // Handle form submission for both Create and Update
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('productId').value;
            const newProductData = {
                name: document.getElementById('productName').value,
                description: document.getElementById('productDesc').value,
                price: parseInt(document.getElementById('productPrice').value, 10),
                image: document.getElementById('productImage').value,
            };

            let products = getProducts();
            if (id) { // Update existing product
                products = products.map(p => p.id == id ? { ...p, ...newProductData } : p);
            } else { // Create new product
                const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
                products.push({ id: newId, ...newProductData });
            }
            
            saveProducts(products);
            renderProductTable();
            closeModal();
        });

        // Handle clicks on Edit and Delete buttons
        productTableBody.addEventListener('click', (e) => {
            const products = getProducts();
            const target = e.target.closest('button');

            if (!target) return;

            const id = target.dataset.id;
            
            // Handle Edit
            if (target.classList.contains('edit-btn')) {
                const productToEdit = products.find(p => p.id == id);
                openModal(productToEdit);
            }
            
            // Handle Delete
            if (target.classList.contains('delete-btn')) {
                if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                    const updatedProducts = products.filter(p => p.id != id);
                    saveProducts(updatedProducts);
                    renderProductTable();
                }
            }
        });
        
        // Event listeners for modal controls
        addNewProductBtn.addEventListener('click', () => openModal());
        closeModalBtn.addEventListener('click', closeModal);
        document.getElementById('cancelBtn').addEventListener('click', closeModal);
        window.addEventListener('click', (e) => {
            if (e.target == modal) {
                closeModal();
            }
        });

        // === KODE BARU DIMULAI DI SINI ===
        // Event listeners for import/export
        exportBtn.addEventListener('click', handleExport);
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', handleImport);
        // === KODE BARU BERAKHIR DI SINI ===

        // Initial render of the admin table
        renderProductTable();
    }
});