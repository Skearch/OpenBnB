const imagePreviewContainer = document.getElementById('image-preview');
const imagesInput = document.getElementById('images');
const propertyList = document.getElementById('property-list');
const editButton = document.getElementById('edit-button');
const deleteButton = document.getElementById('delete-button');
const createPropertyForm = document.getElementById('createPropertyForm');
const editPropertyForm = document.getElementById('editPropertyForm');

let selectedPropertyId = null;
let uploadedImages = [];
let featuredImage = null;

if (createPropertyForm) {
    uploadedImages = [];
    featuredImage = null;
    if (imagePreviewContainer) imagePreviewContainer.innerHTML = '';
}

function clearFeaturedBorders() {
    imagePreviewContainer.querySelectorAll('img').forEach(img => {
        img.classList.remove('border-4', 'border-blue-500');
    });
    imagePreviewContainer.querySelectorAll('.featured-label').forEach(label => label.remove());
}

function loadExistingImages(existingImages, featuredImageIndex) {
    existingImages.forEach((image, index) => {
        const imageFile = {
            isExisting: true,
            data: image,
        };
        uploadedImages.push(imageFile);

        const isFeatured = index === featuredImageIndex;
        createImagePreview(imageFile, isFeatured);
    });
}

function createImagePreview(imageFile, isFeatured = false) {
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('relative', 'w-32', 'h-32', 'border', 'rounded-lg', 'overflow-hidden');

    const img = document.createElement('img');
    if (imageFile.isExisting) {
        img.src = `data:image/jpeg;base64,${imageFile.data}`;
    } else {
        img.src = URL.createObjectURL(imageFile.data);
    }
    img.classList.add('w-full', 'h-full', 'object-cover');
    imageWrapper.appendChild(img);

    const menu = document.createElement('div');
    menu.classList.add('absolute', 'top-2', 'right-2', 'bg-white', 'shadow', 'rounded-lg', 'hidden', 'z-10');
    menu.innerHTML = `
        <button type="button" class="block px-2 py-1 text-sm text-red-500 hover:bg-gray-100" data-action="delete">Delete</button>
        <button type="button" class="block px-2 py-1 text-sm text-blue-500 hover:bg-gray-100" data-action="feature">Featured</button>
    `;
    imageWrapper.appendChild(menu);

    const menuToggle = document.createElement('button');
    menuToggle.type = 'button';
    menuToggle.classList.add('absolute', 'top-2', 'right-2', 'bg-gray-800', 'text-white', 'rounded-full', 'p-1', 'z-20', 'burger-menu');
    menuToggle.innerHTML = '☰';
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });
    imageWrapper.appendChild(menuToggle);

    if (isFeatured) {
        img.classList.add('border-4', 'border-blue-500');
        featuredImage = imageFile;
        const label = document.createElement('span');
        label.className = 'absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded featured-label';
        label.textContent = 'Featured';
        imageWrapper.appendChild(label);
    }

    menu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'delete') {
            uploadedImages = uploadedImages.filter((imgObj) => imgObj !== imageFile);
            imageWrapper.remove();
            if (featuredImage === imageFile) {
                featuredImage = null;
                clearFeaturedBorders();
            }
        } else if (action === 'feature') {
            uploadedImages = uploadedImages.filter((imgObj) => imgObj !== imageFile);
            uploadedImages.unshift(imageFile);
            featuredImage = imageFile;

            if (imagePreviewContainer) {
                imagePreviewContainer.innerHTML = '';
                uploadedImages.forEach((imgObj, idx) => createImagePreview(imgObj, idx === 0));
            }
        }
        menu.classList.add('hidden');
    });

    imagePreviewContainer.appendChild(imageWrapper);
}

if (imagesInput) {
    imagesInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach((file) => {
            if (uploadedImages.length >= 5) {
                alert('You can only upload up to 5 images.');
                return;
            }
            const imageFile = { isExisting: false, data: file };
            uploadedImages.push(imageFile);
            createImagePreview(imageFile);
        });
        imagesInput.value = '';
    });
}

function base64ToBlob(base64, mime = 'image/jpeg') {
    const byteChars = atob(base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
}

function handleFormSubmit(e, isEdit = false) {
    e.preventDefault();

    if (uploadedImages.length < 2) {
        alert('You must upload at least 2 images.');
        return;
    }

    if (!featuredImage) {
        alert('You must select one image as the featured image.');
        return;
    }

    const formData = new FormData(e.target);

    let featuredFile;
    if (featuredImage.isExisting) {
        featuredFile = base64ToBlob(featuredImage.data);
    } else {
        featuredFile = featuredImage.data;
    }
    formData.append('featuredImage', featuredFile);

    uploadedImages.forEach((img) => {
        if (img !== featuredImage) {
            let file;
            if (img.isExisting) {
                file = base64ToBlob(img.data);
            } else {
                file = img.data;
            }
            formData.append('images', file);
        }
    });

    const id = formData.get('id');
    const url = isEdit ? `/api/property/edit/${id}` : `/api/property/create`;
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
        method,
        body: formData,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to save property');
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                window.location.href = '/dashboard/properties';
            } else {
                alert(data.message || 'An error occurred.');
            }
        })
        .catch((err) => {
            console.error(err);
            alert('An error occurred while saving the property.');
        });
}

if (createPropertyForm) {
    createPropertyForm.addEventListener('submit', (e) => handleFormSubmit(e, false));
}

if (editPropertyForm) {
    editPropertyForm.addEventListener('submit', (e) => handleFormSubmit(e, true));
    uploadedImages = [];
    featuredImage = null;
    if (imagePreviewContainer) imagePreviewContainer.innerHTML = '';
    const existingImages = JSON.parse(editPropertyForm.dataset.existingImages || '[]');
    let featuredImageIndex = parseInt(editPropertyForm.dataset.featuredImageIndex, 10);
    if (isNaN(featuredImageIndex) || featuredImageIndex < 0) featuredImageIndex = 0;
    loadExistingImages(existingImages, featuredImageIndex);
}
if (propertyList) {
    propertyList.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        propertyList.querySelectorAll('tr').forEach((tr) => tr.classList.remove('bg-gray-200'));
        row.classList.add('bg-gray-200');
        selectedPropertyId = row.dataset.id;

        editButton.disabled = false;
        deleteButton.disabled = false;
    });

    editButton.addEventListener('click', () => {
        if (selectedPropertyId) {
            window.location.href = `/dashboard/properties/edit/${selectedPropertyId}`;
        }
    });

    deleteButton.addEventListener('click', () => {
        if (selectedPropertyId && confirm('Are you sure you want to delete this property?')) {
            fetch(`/api/property/delete/${selectedPropertyId}`, { method: 'DELETE' })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        window.location.reload();
                    } else {
                        alert(data.message || 'An error occurred.');
                    }
                })
                .catch((err) => console.error(err));
        }
    });
}

async function fetchProperties() {
    try {
        const response = await fetch('/api/property/listall');
        const data = await response.json();

        if (data.success) {
            propertyList.innerHTML = '';
            data.properties.forEach(property => {
                const row = document.createElement('tr');
                row.dataset.id = property.id;

                row.innerHTML = `
                    <td class="border border-gray-300 px-2 py-1">${property.name}</td>
                    <td class="border border-gray-300 px-2 py-1">${property.price}</td>
                    <td class="border border-gray-300 px-2 py-1">${property.showcase ? 'Yes' : 'No'}</td>
                `;

                propertyList.appendChild(row);
            });
        } else {
            alert('Failed to fetch properties.');
        }
    } catch (error) {
        console.error('Error fetching properties:', error);
        alert('An error occurred while fetching properties.');
    }
}

if (propertyList) {
    fetchProperties();
}