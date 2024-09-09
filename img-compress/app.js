const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const compressionLevel = document.getElementById('compressionLevel');
const compressionValue = document.getElementById('compressionValue');
const compressButton = document.getElementById('compressButton');
const downloadLink = document.getElementById('downloadLink');
const statusBox = document.getElementById('statusBox');
const previewSection = document.getElementById('previewSection'); // The container for image previews

let images = [];
let originalFileNames = [];

// Initially hide the preview section
previewSection.style.display = 'none';

// Display images in a scrollable preview section with the ability to remove
imageUpload.addEventListener('change', function(event) {
  const files = event.target.files;
  imagePreview.innerHTML = '';
  images = [];
  originalFileNames = [];

  if (files.length > 0) {
    // Show the preview section when images are selected
    previewSection.style.display = 'block';
  } else {
    // Hide the preview section if no images are selected
    previewSection.style.display = 'none';
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    originalFileNames.push(file.name.split('.').slice(0, -1).join('.')); // Keep original name without extension
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function() {
          images.push(img);

          // Create a div to contain the image and remove button
          const imgContainer = document.createElement('div');
          imgContainer.style.position = 'relative';
          imgContainer.style.display = 'inline-block';
          imgContainer.style.margin = '10px';

          // Image element
          const imgElement = document.createElement('img');
          imgElement.src = img.src;
          imgElement.style.maxWidth = '100px';
          imgElement.style.height = 'auto';
          imgContainer.appendChild(imgElement);

          // Remove button
          const removeButton = document.createElement('button');
          removeButton.textContent = 'Remove';
          removeButton.style.position = 'absolute';
          removeButton.style.top = '5px';
          removeButton.style.right = '5px';
          removeButton.style.backgroundColor = 'red';
          removeButton.style.color = 'white';
          removeButton.style.border = 'none';
          removeButton.style.cursor = 'pointer';

          // Add remove functionality
          removeButton.addEventListener('click', function() {
            imgContainer.remove();
            images.splice(images.indexOf(img), 1); // Remove the image from the array
            originalFileNames.splice(i, 1); // Remove the corresponding filename

            // Hide preview section if no images are left
            if (images.length === 0) {
              previewSection.style.display = 'none';
            }
          });

          imgContainer.appendChild(removeButton);
          imagePreview.appendChild(imgContainer);
        };
      };
      reader.readAsDataURL(file);
    }
  }
});

compressionLevel.addEventListener('input', function() {
  compressionValue.textContent = compressionLevel.value;
});

compressButton.addEventListener('click', function() {
  if (images.length === 0) {
    alert('Please upload at least one image!');
    return;
  }

  const quality = parseFloat(compressionLevel.value);
  
  statusBox.classList.remove('success', 'error');
  statusBox.textContent = 'Compressing images, please wait...';

  if (images.length === 1) {
    compressSingleImage(images[0], quality, originalFileNames[0]);
  } else {
    compressMultipleImages(images, quality, originalFileNames);
  }
});

function compressSingleImage(image, quality, originalFileName) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Ensure original dimensions are retained
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(function(blob) {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const fileName = `${originalFileName} Compressed by Mahin.jpg`;
      downloadLink.href = url;
      downloadLink.download = fileName;
      downloadLink.style.display = 'inline-block';
      downloadLink.classList.add('animate-button');
      statusBox.textContent = 'Compression done successfully!';
      statusBox.classList.add('success');
    } else {
      statusBox.textContent = 'Compression failed, please try again!';
      statusBox.classList.add('error');
    }
  }, 'image/jpeg', quality);
}

function compressMultipleImages(images, quality, fileNames) {
  const zip = new JSZip();
  
  let completed = 0;

  images.forEach((image, index) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Ensure original dimensions are retained
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(function(blob) {
      if (blob) {
        const fileName = `${fileNames[index]} Compressed by Mahin.jpg`;
        zip.file(fileName, blob);
        completed++;

        if (completed === images.length) {
          zip.generateAsync({ type: 'blob' }).then(function(content) {
            const url = URL.createObjectURL(content);
            downloadLink.href = url;
            downloadLink.download = 'Compressed by Mahin.zip';
            downloadLink.style.display = 'inline-block';
            downloadLink.classList.add('animate-button');
            statusBox.textContent = 'All images compressed successfully!';
            statusBox.classList.add('success');
          });
        }
      } else {
        statusBox.textContent = 'Compression failed, please try again!';
        statusBox.classList.add('error');
      }
    }, 'image/jpeg', quality);
  });
}
