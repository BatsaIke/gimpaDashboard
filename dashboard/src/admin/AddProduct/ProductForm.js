import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import styles from "./AddProductForm.module.css";

const ProductForm = ({ onSubmit, product }) => {
  const [fileName, setFileName] = useState(""); // State to store the uploaded file name
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      variants: product?.variants || [{ name: "", price: "", size: "" }],
    },
  });

  const { fields, append } = useFieldArray({
    control,
    name: "variants",
  });

  const isEditing = !!product;

  // Convert file to Base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const submitHandler = async (data) => {
    let base64Image = "";

    if (data.image && data.image[0]) {
      base64Image = await convertFileToBase64(data.image[0]);
    }

    const productData = {
      image: base64Image,
      name: data.name,
      category: data.category,
      description: data.description,
      variants: data.variants,
    };

    onSubmit(productData);
  };

  useEffect(() => {
    if (product) {
      setValue("name", product.name);
      setValue("category", product.category);
      setValue("description", product.description);
    }
  }, [product, setValue]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name); // Update the file name
    }
  };

  return (
    <form className={styles.addForm} onSubmit={handleSubmit(submitHandler)}>
      {/* Product Details Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Product Details</h3>

        {/* Image Upload (dashed box) */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Image Upload*</label>
          <label htmlFor="image" className={styles.uploadBox}>
            <i className="fas fa-upload"></i> {/* Icon for upload */}
            {fileName ? (
              <span className={styles.fileName}>{fileName}</span>
            ) : (
              <span>Click here or Drop your file here to upload it</span>
            )}
          </label>
          <input
            type="file"
            id="image"
            {...register("image", {
              required: !isEditing && "Product image is required",
            })}
            accept="image/png, image/jpeg"
            className={styles.hiddenFileInput}
            onChange={handleFileChange} // Capture file name on change
          />
          {errors.image && (
            <span className={styles.error}>{errors.image.message}</span>
          )}
        </div>

        {/* Product Name */}
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Product Name*
          </label>
          <input
            type="text"
            id="name"
            placeholder="Enter product name"
            {...register("name", { required: "Product name is required" })}
            className={styles.input}
          />
          {errors.name && (
            <span className={styles.error}>{errors.name.message}</span>
          )}
        </div>

        {/* Category */}
        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            Category*
          </label>
          <select
            id="category"
            {...register("category", { required: "Category is required" })}
            className={styles.input}
          >
            <option value="">Select a Category</option>
            <option value="Highs">Highs</option>
            <option value="Bites">Bites</option>
            <option value="Drinks">Drinks</option>
            <option value="Accessories">Accessories</option>
          </select>
          {errors.category && (
            <span className={styles.error}>{errors.category.message}</span>
          )}
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Product Description
          </label>
          <textarea
            id="description"
            placeholder="Enter description"
            {...register("description")}
            rows="3"
            className={styles.textarea}
          />
        </div>
      </div>

      {/* Product Variants Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Product Variants</h3>

        {fields.map((field, index) => (
          <div key={field.id} className={styles.variantRow}>
            {/* Variant Name */}
            <input
              type="text"
              placeholder="Enter name"
              {...register(`variants.${index}.name`, {
                required: "Variant name is required",
              })}
              className={styles.inputVariant}
            />
            {/* Price */}
            <input
              type="number"
              placeholder="Enter price"
              {...register(`variants.${index}.price`, {
                required: "Price is required",
              })}
              className={styles.inputVariant}
            />
            {/* Size */}
            <select
              {...register(`variants.${index}.size`, {
                required: "Size is required",
              })}
              className={styles.inputVariant}
            >
              <option value="">size</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
            {/* Remove Button is omitted to match the design */}
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ name: "", price: "", size: "" })}
          className={styles.addVariantButton}
        >
          + Add another variant
        </button>
      </div>

      {/* Footer Section (with border-top, right-aligned button) */}
      <div className={styles.footer}>
        <button type="submit" className={styles.submitButton}>
          {isEditing ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
