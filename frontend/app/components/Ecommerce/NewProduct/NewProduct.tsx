"use client";

import { useState, Fragment } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProducts } from "../../../context/ProductContext";
import "../../../styles/NewProduct.css";

const steps = ["Product Info", "Media", "Social", "Pricing"];

const NewProduct = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const { createProduct } = useProducts();
    const router = useRouter();

    // Step 1: Product Info
    const [name, setName] = useState("");
    const [weight, setWeight] = useState("");
    const [size, setSize] = useState("Large");
    const [category, setCategory] = useState("Clothing");
    const [description, setDescription] = useState("");
    const [quantity, setQuantity] = useState("");

    // Step 2: Media
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    // Step 3: Social
    const [facebookAccount, setFacebookAccount] = useState("");
    const [instagramAccount, setInstagramAccount] = useState("");
    const [linkedinAccount, setLinkedinAccount] = useState("");
    const [dribbbleAccount, setDribbbleAccount] = useState("");
    const [behanceAccount, setBehanceAccount] = useState("");
    const [ui8Account, setUi8Account] = useState("");

    // Step 4: Pricing
    const [price, setPrice] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [sku, setSku] = useState("");
    const [status, setStatus] = useState("In Stock");

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

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

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setSubmitting(true);
        const formData = new FormData();
        formData.append("name", name);
        formData.append("weight", weight);
        formData.append("size", size);
        formData.append("category", category);
        formData.append("description", description);
        formData.append("facebookAccount", facebookAccount);
        formData.append("instagramAccount", instagramAccount);
        formData.append("linkedinAccount", linkedinAccount);
        formData.append("dribbbleAccount", dribbbleAccount);
        formData.append("behanceAccount", behanceAccount);
        formData.append("ui8Account", ui8Account);
        formData.append("price", price);
        formData.append("currency", currency);
        formData.append("sku", sku);
        formData.append("quantity", quantity);
        formData.append("status", status);
        if (uploadedFile) formData.append("image", uploadedFile);

        const res = await createProduct(formData);
        setSubmitting(false);
        if (res.success) {
            router.push("/ecommerce/products/list");
        }
    };

    return (
        <div className="new-product-page">
            {/* Header */}
            <header className="new-product-header">
                <h2>New Product</h2>
                <div className="new-product-search">
                    <input type="text" placeholder="Search anything here..." />
                    <Search size={18} className="search-icon" />
                </div>
            </header>

            {/* Stepper */}
            <div className="stepper">
                {steps.map((label, index) => (
                    <Fragment key={label}>
                        {index > 0 && <div className="stepper-line" />}
                        <div
                            className={`step ${index === currentStep ? "active" : ""}`}
                            onClick={() => setCurrentStep(index)}
                        >
                            <span className="step-number">{index + 1}</span>
                            <span className="step-label">{label}</span>
                        </div>
                    </Fragment>
                ))}
            </div>

            {/* Form Card */}
            <div className="product-form-card">
                {/* Step 1: Product Info */}
                {currentStep === 0 && (
                    <>
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

                        <div className="form-row">
                            <div className="form-field">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                            <div className="form-field"></div>
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
                    </>
                )}

                {/* Step 2: Media */}
                {currentStep === 1 && (
                    <>
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
                    </>
                )}

                {/* Step 3: Social */}
                {currentStep === 2 && (
                    <>
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
                    </>
                )}

                {/* Step 4: Pricing */}
                {currentStep === 3 && (
                    <>
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
                                <label>Status</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="In Stock">In Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                </select>
                            </div>
                        </div>
                    </>
                )}

                {/* Actions */}
                <div className="form-actions">
                    {currentStep > 0 && (
                        <button className="btn-prev" onClick={handlePrev}>
                            Previous
                        </button>
                    )}
                    {currentStep < steps.length - 1 ? (
                        <button className="btn-next" onClick={handleNext}>
                            Next
                        </button>
                    ) : (
                        <button className="btn-next" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewProduct;
