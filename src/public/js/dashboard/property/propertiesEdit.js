class PropertyImageEditor {
  constructor(imagePreviewContainer, imagesInput) {
    this.imagePreviewContainer = imagePreviewContainer;
    this.imagesInput = imagesInput;
    this.uploadedImages = [];
    this.featuredImage = null;
    this.maxImages = 5;
    this.init();
  }

  init() {
    if (this.imagesInput) {
      this.imagesInput.addEventListener("change", (e) =>
        this.handleImageChange(e)
      );
    }
  }

  clearFeaturedBorders() {
    this.imagePreviewContainer.querySelectorAll("img").forEach((img) => {
      img.classList.remove("border-4", "border-blue-500");
    });
    this.imagePreviewContainer
      .querySelectorAll(".featured-label")
      .forEach((label) => label.remove());
  }

  loadExistingImages(existingImages, featuredImageIndex) {
    existingImages.forEach((image, index) => {
      const imageFile = { isExisting: true, data: image };
      this.uploadedImages.push(imageFile);
      const isFeatured = index === featuredImageIndex;
      this.createImagePreview(imageFile, isFeatured);
    });
  }

  createImagePreview(imageFile, isFeatured = false) {
    const imageWrapper = document.createElement("div");
    imageWrapper.classList.add(
      "relative",
      "w-32",
      "h-32",
      "border",
      "rounded-lg",
      "overflow-hidden"
    );

    const img = document.createElement("img");
    img.src = imageFile.isExisting
      ? imageFile.data
      : URL.createObjectURL(imageFile.data);
    img.classList.add("w-full", "h-full", "object-cover");
    imageWrapper.appendChild(img);

    const menu = document.createElement("div");
    menu.classList.add(
      "absolute",
      "top-2",
      "right-8",
      "bg-white",
      "rounded-lg",
      "shadow",
      "hidden",
      "z-10"
    );
    menu.innerHTML = `
      <button type="button" class="block w-full rounded-lg text-center px-2 py-1 text-sm text-red-500 hover:bg-gray-100" data-action="delete">Delete</button>
      <button type="button" class="block w-full rounded-lg text-center px-2 py-1 text-sm text-blue-500 hover:bg-gray-100" data-action="feature">Featured</button>
    `;
    imageWrapper.appendChild(menu);

    const menuToggle = document.createElement("button");
    menuToggle.type = "button";
    menuToggle.classList.add(
      "absolute",
      "top-2",
      "right-2",
      "bg-gray-800",
      "rounded-lg",
      "text-white",
      "p-1",
      "z-20",
      "burger-menu"
    );
    menuToggle.innerHTML = "☰";
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("hidden");
    });
    imageWrapper.appendChild(menuToggle);

    if (isFeatured) {
      img.classList.add("border-4", "border-blue-500");
      this.featuredImage = imageFile;
      const label = document.createElement("span");
      label.className =
        "absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded featured-label";
      label.textContent = "Featured";
      imageWrapper.appendChild(label);
    }

    menu.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (action === "delete") {
        this.uploadedImages = this.uploadedImages.filter(
          (imgObj) => imgObj !== imageFile
        );
        imageWrapper.remove();
        if (this.featuredImage === imageFile) {
          this.featuredImage = null;
          this.clearFeaturedBorders();
        }
      } else if (action === "feature") {
        this.uploadedImages = this.uploadedImages.filter(
          (imgObj) => imgObj !== imageFile
        );
        this.uploadedImages.unshift(imageFile);
        this.featuredImage = imageFile;
        if (this.imagePreviewContainer) {
          this.imagePreviewContainer.innerHTML = "";
          this.uploadedImages.forEach((imgObj, idx) =>
            this.createImagePreview(imgObj, idx === 0)
          );
        }
      }
      menu.classList.add("hidden");
    });

    this.imagePreviewContainer.appendChild(imageWrapper);
  }

  handleImageChange(e) {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (this.uploadedImages.length >= this.maxImages) {
        alert("You can only upload up to 5 images.");
        return;
      }
      const imageFile = { isExisting: false, data: file };
      this.uploadedImages.push(imageFile);
      this.createImagePreview(imageFile);
    });
    this.imagesInput.value = "";
  }

  base64ToBlob(base64, mime = "image/jpeg") {
    const byteChars = atob(base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  }

  getFormData(form) {
    if (this.uploadedImages.length < 2) {
      alert("You must upload at least 2 images.");
      return null;
    }
    if (!this.featuredImage) {
      alert("You must select one image as the featured image.");
      return null;
    }
    const formData = new FormData(form);

    const existingImageUrls = this.uploadedImages
      .filter((img) => img.isExisting)
      .map((img) => img.data.replace("/uploads/", ""));

    this.uploadedImages.forEach((img) => {
      if (!img.isExisting) {
        formData.append("images", img.data);
      }
    });

    if (this.featuredImage.isExisting) {
      formData.append(
        "featuredImagePath",
        this.featuredImage.data.replace("/uploads/", "")
      );
    } else {
      formData.append("featuredImage", this.featuredImage.data);
    }

    const otherExistingImages = existingImageUrls.filter(
      (filename) => filename !== formData.get("featuredImagePath")
    );
    formData.append("existingImages", JSON.stringify(otherExistingImages));

    return formData;
  }
}

class EditPropertyFormHandler {
  constructor(form, imageEditor) {
    this.form = form;
    this.imageEditor = imageEditor;
    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const formData = this.imageEditor.getFormData(e.target);
    if (!formData) return;
    const id = formData.get("id");
    fetch(`/api/property/edit/${id}`, {
      method: "PUT",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to save property");
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          window.location.href = "/dashboard/properties";
        } else {
          alert(data.message || "An error occurred.");
        }
      })
      .catch(() => {
        alert("An error occurred while saving the property.");
      });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const imagePreviewContainer = document.getElementById("image-preview");
  const imagesInput = document.getElementById("images");
  const editPropertyForm = document.getElementById("editPropertyForm");
  const imageEditor = new PropertyImageEditor(
    imagePreviewContainer,
    imagesInput
  );
  if (editPropertyForm) {
    imageEditor.uploadedImages = [];
    imageEditor.featuredImage = null;
    if (imagePreviewContainer) imagePreviewContainer.innerHTML = "";
    const existingImages = JSON.parse(
      editPropertyForm.dataset.existingImages || "[]"
    );
    let featuredImageIndex = parseInt(
      editPropertyForm.dataset.featuredImageIndex,
      10
    );
    if (isNaN(featuredImageIndex) || featuredImageIndex < 0)
      featuredImageIndex = 0;
    imageEditor.loadExistingImages(existingImages, featuredImageIndex);
    new EditPropertyFormHandler(editPropertyForm, imageEditor);
  }
});
