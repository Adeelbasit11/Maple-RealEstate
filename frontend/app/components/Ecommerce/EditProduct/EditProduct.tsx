"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import "../../../styles/EditProduct.css";

const EditProduct = () => {
    // Product Info (pre-filled)
    const [name, setName] = useState("Off-White");
    const [weight, setWeight] = useState("42");
    const [size, setSize] = useState("Large");
    const [category, setCategory] = useState("Clothing");
    const [description, setDescription] = useState("Some initial bold text");

    // Media
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    // Social (pre-filled)
    const [facebookAccount, setFacebookAccount] = useState("@warner");
    const [instagramAccount, setInstagramAccount] = useState("@warner");
    const [linkedinAccount, setLinkedinAccount] = useState("@warner");
    const [dribbbleAccount, setDribbbleAccount] = useState("@warner");
    const [behanceAccount, setBehanceAccount] = useState("@warner");
    const [ui8Account, setUi8Account] = useState("@warner");

    // Pricing (pre-filled)
    const [price, setPrice] = useState("$100");
    const [currency, setCurrency] = useState("USD");
    const [sku, setSku] = useState("829672639");
    const [tags, setTags] = useState("In stock");

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setUploadedFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        console.log("Product updated:", {
            name, weight, size, category, description,
            uploadedFile,
            facebookAccount, instagramAccount, linkedinAccount, dribbbleAccount, behanceAccount, ui8Account,
            price, currency, sku, tags
        });
    };

    return (
        <div className="edit-product-page">
            {/* Header */}
            <header className="edit-product-header">
                <h2>Edit Product</h2>
                <div className="edit-product-search">
                    <input type="text" placeholder="Search anything here..." />
                    <Search size={18} className="search-icon" />
                </div>
            </header>

            {/* Main White Container */}
            <div className="edit-product-container">
                {/* Section 1: Product Information */}
                <div className="form-section">
                    <h3>Product Information</h3>
                    <div className="form-row">
                        <div className="form-field">
                            <label>Name</label>
                            <input
                                type="text"
                                placeholder="Off -White"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="form-field">
                            <label>Weight</label>
                            <input
                                type="text"
                                placeholder="42"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label>Sizes</label>
                            <select value={size} onChange={(e) => setSize(e.target.value)}>
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                                <option value="Large">Large</option>
                                <option value="XL">XL</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="Clothing">Clothing</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Furniture">Furniture</option>
                                <option value="Accessories">Accessories</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row half">
                        <div className="form-field">
                            <label>Description</label>
                            <input
                                type="text"
                                placeholder="Some initial bold text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div></div>
                    </div>
                </div>

                {/* Section 2: Media */}
                <div className="form-section">
                    <h3>Media</h3>
                    <div
                        className={`dropzone ${dragActive ? "drag-active" : ""}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className="dropzone-icon">
                            <img src="/upload.png" alt="upload" />
                        </div>
                        {uploadedFile ? (
                            <p className="dropzone-text">{uploadedFile.name}</p>
                        ) : (
                            <>
                                <p className="dropzone-text">
                                    Drop your image here or{" "}
                                    <label htmlFor="file-upload" className="browse-link">Browse</label>
                                </p>
                                <p className="dropzone-support">Support: JPG, JPEG, PNG</p>
                            </>
                        )}
                        <input
                            id="file-upload"
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            hidden
                        />
                    </div>
                </div>

                {/* Section 3: Social */}
                <div className="form-section">
                    <h3>Social</h3>
                    <div className="form-row">
                        <div className="form-field">
                            <label>Facebook Account</label>
                            <input
                                type="text"
                                placeholder="@warner"
                                value={facebookAccount}
                                onChange={(e) => setFacebookAccount(e.target.value)}
                            />
                        </div>
                        <div className="form-field">
                            <label>Instagram Account</label>
                            <input
                                type="text"
                                placeholder="@warner"
                                value={instagramAccount}
                                onChange={(e) => setInstagramAccount(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field">
                            <label>LinkedIn Account</label>
                            <input
                                type="text"
                                placeholder="@warner"
                                value={linkedinAccount}
                                onChange={(e) => setLinkedinAccount(e.target.value)}
                            />
                        </div>
                        <div className="form-field">
                            <label>Dribble Account</label>
                            <input
                                type="text"
                                placeholder="@warner"
                                value={dribbbleAccount}
                                onChange={(e) => setDribbbleAccount(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field">
                            <label>Behance Account</label>
                            <input
                                type="text"
                                placeholder="@warner"
                                value={behanceAccount}
                                onChange={(e) => setBehanceAccount(e.target.value)}
                            />
                        </div>
                        <div className="form-field">
                            <label>UI8 Account</label>
                            <input
                                type="text"
                                placeholder="@warner"
                                value={ui8Account}
                                onChange={(e) => setUi8Account(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 4: Pricing */}
                <div className="form-section">
                    <h3>Pricing</h3>
                    <div className="form-row">
                        <div className="form-field">
                            <label>Price</label>
                            <input
                                type="text"
                                placeholder="$100"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div className="form-field">
                            <label>Currency</label>
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="PKR">PKR</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field">
                            <label>SKU</label>
                            <input
                                type="text"
                                placeholder="829672639"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                            />
                        </div>
                        <div className="form-field">
                            <label>Tags</label>
                            <input
                                type="text"
                                placeholder="In stock"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                    <button className="btn-next" onClick={handleSubmit}>
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
