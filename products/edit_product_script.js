// Import Firebase modules and configuration files
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, ref, get, update } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js';
import firebaseConfig from "../firebaseConfig.js"; // Assuming this contains your Firebase configuration
import imgbbAPIKey from "../imgbbConfig.js"; // Assuming this contains your imgBB API key
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js';

// Initialize Firebase app with the provided configuration
const app = initializeApp(firebaseConfig);

// Get a reference to the Firebase database
const database = getDatabase(app);

// Initialize variables to store product data
let productName, productDescription, productCode, productBrand, productCategory, image_urls, specifications = [];

// Get references to form inputs and image preview element
const productNameInput = document.getElementById("product_name"),
productCategoryInput = document.getElementById("product_category"),
productBrandInput = document.getElementById("product_brand"),
productCodeInput = document.getElementById("product_code"),
productDescriptionInput = document.getElementById("product_description"),
imgPreview = document.getElementById("imgPreviewDiv");

// Get the container for displaying toast messages
const toastContainer = document.getElementById("toastContainer");

// Function to display toast messages
function showToast(message) {
    toastContainer.textContent = message;
    toastContainer.style.display = "block";
    setTimeout(function () {
        toastContainer.style.display = "none";
    }, 3000); // Hide after 3 seconds (adjust as needed)
}

// Function to extract URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

// Get the product ID from the URL parameters
const productId = getUrlParameter('id');

const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {

    const isLoggedInLocalStorage = localStorage.getItem('isLoggedIn');
    if (!user || isLoggedInLocalStorage !== 'true') {
        window.location.href = '../';
    }
});


document.getElementById("edit_product_form").addEventListener('submit', (e) =>{
    e.preventDefault();
})


function getBrandsFromFirebase() {
    // Reference to the brand data in Firebase RTDB
    const brandsRef = ref(database, 'brands');

    get(brandsRef).then((snapshot) => {
      const brandsData = snapshot.val();
    
      // Check if there are brands in the database
      if (brandsData) {
        // Get a reference to the select element
        const selectElement = document.getElementById('product_brand');
    
        // Loop through the brands object and create option elements
        Object.keys(brandsData).forEach((brandKey) => {
            const brandName = brandKey; // Get the brand name (key)
            const option = document.createElement('option'); // Create an option element
            option.value = brandName; // Set the value of the option
            option.textContent = brandName; // Set the text content of the option
            selectElement.appendChild(option); // Append the option to the select element
          });

          const defaultOption = document.createElement('option'); // Create an option element
          defaultOption.value = "None"; // Set the value of the option
          defaultOption.textContent = "None"; // Set the text content of the option
          selectElement.appendChild(defaultOption);

      }
    }); 
  }
  function getCategoriesFromFirebase() {
    // Reference to the brand data in Firebase RTDB
    const categoriesRef = ref(database, 'categories');

    get(categoriesRef).then((snapshot) => {
      const categoriesData = snapshot.val();
    
      // Check if there are brands in the database
      if (categoriesData) {
        // Get a reference to the select element
        const selectElement = document.getElementById('product_category');
    
        // Loop through the brands object and create option elements
        Object.keys(categoriesData).forEach((categoryKey) => {
            const categoryName = categoriesData[categoryKey]; // Get the brand name (key)
            const option = document.createElement('option'); // Create an option element
            option.value = categoryName; // Set the value of the option
            option.textContent = categoryName; // Set the text content of the option
            selectElement.appendChild(option); // Append the option to the select element
          });

          const defaultOption = document.createElement('option'); // Create an option element
          defaultOption.value = "None"; // Set the value of the option
          defaultOption.textContent = "None"; // Set the text content of the option
          selectElement.appendChild(defaultOption);

      }
    }); 
  }


  getBrandsFromFirebase();
  getCategoriesFromFirebase();


  function displaySpecifications() {
    const addedSpecificationsDiv = document.getElementById('added_specifications');

    addedSpecificationsDiv.innerHTML = '';
  
    specifications.forEach(spec => {

      const specElement = document.createElement('div');
      specElement.classList.add('spec-item');
      specElement.innerHTML = `
      <p><span>${spec.field}</span> : ${spec.value}</p>

      <button class="image-data-button" id="delete-button-${specifications.indexOf(spec)}"><img src="../images/deleteIcon.png" alt="Delete Icon" width="30px" title="Delete"></button>
      `;
      
      addedSpecificationsDiv.appendChild(specElement);
      attachDynamicEventListener(specifications.indexOf(spec));
    });

  }


  function displayImages() {

    imgPreview.innerHTML = '';

    primaryIndex = 0;
    
    image_urls.forEach(image => {

      const imageElement = document.createElement('div');
      imageElement.classList.add('image-item');
      const index = image_urls.indexOf(image);
      imageElement.innerHTML = `
      <img src="${image}" />

      <div>

        <input type="checkbox" id="select-${index}" name="select-${index}" value="select-${index}" ${index == 0 ? "checked" : ""}>
        <label for="select-${index}">Primary Image</label>
        <button class="image-data-button" id="img-delete-button-${image_urls.indexOf(image)}"><img src="../images/deleteIcon.png" alt="Delete Icon" width="30px" title="Delete"></button>
        </div>

      `;
      
      imgPreview.appendChild(imageElement);

      attachDynamicEventListener2(index);
    });

  }


  function attachDynamicEventListener(index) {

    const deleteButtonId = `delete-button-${index}`;

    const deleteButton = document.getElementById(deleteButtonId);

    if (deleteButton) {
        deleteButton.addEventListener("click", function () {

            Swal.fire({
                title: "Sure?",
                text: "Are you sure you want to delete this specification?",
                icon: "warning",
                showCancelButton: true, // Show cancel button
                confirmButtonText: "Yes",
                cancelButtonText: "Cancel",
                confirmButtonColor: '#490f0d',
            }).then((result) => {

                if (result.isConfirmed) {
                    if (index > -1) {
                        specifications.splice(index, 1); 
                    }

                    displaySpecifications();

                } else {
                    toastContainer.style.background = "rgb(204, 0, 0)";

                    showToast('Delete Cancelled');
                }

            });

        })

    }

}


let checkboxes = [];

function attachDynamicEventListener2(index) {

  const deleteButtonId = `img-delete-button-${index}`;
  const deleteButton = document.getElementById(deleteButtonId);

  const checkboxId = `select-${index}`;
  const checkbox = document.getElementById(checkboxId);

  if (deleteButton) {
      deleteButton.addEventListener("click", function () {

          Swal.fire({
              title: "Sure?",
              text: "Are you sure you want to delete this image?",
              icon: "warning",
              showCancelButton: true, // Show cancel button
              confirmButtonText: "Yes",
              cancelButtonText: "Cancel",
              confirmButtonColor: '#490f0d',
          }).then((result) => {

              if (result.isConfirmed) {
                  if (index > -1) {
                      image_urls.splice(index, 1); 
                  }

                  displayImages();

              } else {
                  toastContainer.style.background = "rgb(204, 0, 0)";

                  showToast('Delete Cancelled');
              }

          });

      })

  }

  

  if (checkbox) {

      checkbox.addEventListener('change', function (event) {

          const isChecked = event.target.checked;

          checkboxes = document.querySelectorAll('#imgPreviewDiv input[type="checkbox"]');

          for (let i = 0; i < checkboxes.length; i++) {
              checkboxes[i].checked = false;                
          }

          if (isChecked) {

              primaryIndex = index;

          }else{

              primaryIndex = 0;

          }

          checkbox.checked = isChecked;


      });

  }

}



  function addSpecification() {
    
    const field = document.getElementById('specification_field').value;
    const value = document.getElementById('specification_value').value;
  
    // Check if both field and value are provided
    if (field && value) {
      // Add specification to array
      specifications.push({ field, value });
  
      // Display added specifications
      displaySpecifications();
  
      // Clear input fields
      document.getElementById('specification_field').value = '';
      document.getElementById('specification_value').value = '';
    } else {
      // Show error message if field or value is missing
      Swal.fire({
        title: 'Error!',
        text: 'Please enter both specification field and value...',
        icon: 'error',
        confirmButtonText: 'Okay',
        confirmButtonColor: '#490f0d',
      });
    }
  }

  document.getElementById('add_specification').addEventListener('click', addSpecification);


  let primaryIndex = 0;

// Function to fetch product data by ID
function getProductById(productId) {
    const productsRef = ref(database, `products/${productId}`);
    get(productsRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const product = snapshot.val();
                // Extract product data
                productName = product["productName"];
                productDescription = product["productDescription"];
                productBrand = product["productBrand"];
                productCategory = product["productCategory"];
                productCode = product["productCode"];
                image_urls = product["images"];
                specifications = product["specifications"];

                displaySpecifications();
                displayImages();
            
                // Set form inputs and image preview

                document.title = "Edit - " + productName;

                productNameInput.value = productName;
                productBrandInput.value = productBrand;
                productDescriptionInput.value = productDescription;
                productCategoryInput.value = productCategory;
                productCodeInput.value = productCode;
                // Show form container and hide loading spinner
                document.getElementById("upload_product_form_container").style.display = "block"
                document.getElementById("loading-container").style.display = "none"
            } else {
                // Display error message if no product found
                toastContainer.style.background = "#b00000";
                showToast("No product found with ID: " + productId);
                document.getElementById("loading-container").style.display = "none"
            }
        })
        .catch((error) => {
            console.error("Error getting product data:", error);
        });
}

// Fetch product data by ID
getProductById(productId);

// Function to update product data
function updateProductData(productId, newData) {

    const productsRef = ref(database, `products/${productId}`);
    update(productsRef, newData)
        .then(() => {
            // Display success message on update
            toastContainer.style.background = "#490f0d";
            showToast("Product data updated successfully");
        })
        .catch((error) => {
            // Display error message on update failure
            toastContainer.style.background = "#b00000";
            showToast("Error updating product data: " + error);
        });

}

// Event listener for "Done" button click
const doneButton = document.getElementById("uploadButton");
doneButton.addEventListener("click", function () {


        let temp = image_urls[0];
        image_urls[0] = image_urls[primaryIndex];
        image_urls[primaryIndex] = temp;

    // Get updated product data from form inputs
    const newProductName = productNameInput.value;
    const new_product_category = productCategoryInput.value;
    const new_product_code = productCodeInput.value;
    const newProductBrand = productBrandInput.value;
    const new_product_description = productDescriptionInput.value;
    const new_specifications = specifications;
    const new_images = image_urls;
    // Construct updated data object
    
    const newData = {
        productName: newProductName,
        productBrand: newProductBrand,
        productCategory: new_product_category,
        productCode: new_product_code,
        productDescription: new_product_description,
        specifications: new_specifications,
        images: new_images
    };

    // Update product data
    updateProductData(productId, newData);
});
