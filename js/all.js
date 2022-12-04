

const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const cartList = document.querySelector('.shoppingCart-tableList');

let productData = [];
let cartData=[];

function init(){
    getProductList();
    getCartList();
}
init();
function getProductList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function(response){
        productData = response.data.products;
        renderProductList();
        
    })
}

function renderProductList(){
    let str="";
        productData.forEach(function(item){
            str += combineProductHTMLItem(item)
        })
        productList.innerHTML = str;

}

function combineProductHTMLItem(item){
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="js-addCart" id="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$ ${toThousands(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThousands(item.price)}</p>
    </li>`;

}
productSelect.addEventListener('change',function(e){
    const category = e.target.value;
    if(category == "全部"){
        renderProductList();
        return;
    }
    let str="";
    productData.forEach(function(item){
        if(item.category == category){
            str += combineProductHTMLItem(item)

        }
        productList.innerHTML = str;
    })
})

productList.addEventListener("click",function(e){
    
    e.preventDefault();
    let addCartClass = e.target.getAttribute("class");
    if(addCartClass !== "js-addCart"){
        return;
    }
    let productId = e.target.getAttribute("data-id");
    console.log(productId);
    let numCheck = 1;
    cartData.forEach(function(item){
        if(item.product.id === productId){
            numCheck = item.quantity +=1;
        }
    })
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
            "productId": productId,
            "quantity": numCheck
        }
    }).then(function(response){
        alert("加入購物車")
        getCartList();
    })
    
})

function getCartList(){

    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        console.log(response.data.finalTotal);
        document.querySelector(".js-total").textContent =  toThousands(response.data.finalTotal);
        cartData = response.data.carts;
        let str = "";
        cartData.forEach(function(item){
            str +=`<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${toThousands(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${toThousands(item.product.price*item.quantity)}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id=${item.id}>
                    clear
                </a>
            </td>
        </tr>`
        });
        
        cartList.innerHTML = str;
        
    })
}

cartList.addEventListener('click',function(e){
    e.preventDefault();
    const cartId = e.target.getAttribute("data-id");
    if(cartId == null){
        alert("你點到其他東西了")
        return;
    }  
    console.log(cartId);
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function(response){
        alert("刪除單筆購物車成功");
        getCartList();
    })
    
})
const discardAllBtn = document.querySelector(".discardAllBtn");

discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        alert("刪除全部購物車成功");
        getCartList();
    })
    .catch(function(response){
        alert("購物車已清空,請勿重複點擊");
    })
})

//送出訂單

const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click",function(e){
    e.preventDefault();
    if(cartData.length == 0){
        alert("請加入購物車");
        return;
    }
    const customerName = document.querySelector("#customerName").value;
    const customerPhone = document.querySelector("#customerPhone").value;
    const customerEmail = document.querySelector("#customerEmail").value;
    const customerAddress = document.querySelector("#customerAddress").value;
    const customerTradeWay = document.querySelector("#tradeWay").value;
 
    if(customerName==""|| customerPhone==""||customerEmail==""|| customerAddress==""||customerTradeWay==""){
        alert("請輸入訂單資訊");
        return;
    }
    if(validateEmail(customerEmail)==false){
        alert("請填寫正確的Email");
        return;
    }
    
    if(validatePhone(customerPhone)==false){
        alert("請填寫正確的電話");
        return;
    }

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
        "data": {
            "user": {
              "name": customerName,
              "tel": customerPhone,
              "email": customerEmail,
              "address": customerAddress,
              "payment": customerTradeWay
            }
          }
    }).then(function(response){
        alert("訂單成功建立");
        document.querySelector("#customerName").value = "";
        document.querySelector("#customerPhone").value = "";
        document.querySelector("#customerEmail").value = "";
        document.querySelector("#customerAddress").value = "";
        document.querySelector("#tradeWay").value= "ATM";
        getCartList();
    })
})

const customerEmail = document.querySelector("#customerEmail");
customerEmail.addEventListener("blur",function(e){
    if(validateEmail(customerEmail.value)==false){
        document.querySelector(`[data-message=Email]`).textContent = "請填寫正確Email格式";
        return;
    } else{
        document.querySelector(`[data-message=Email]`).textContent = "";
    return;
} 
})

const customerPhone = document.querySelector("#customerPhone");
customerPhone.addEventListener("blur",function(e){
    if(validatePhone(customerPhone.value)==false){
        document.querySelector(`[data-message="電話"]`).textContent = "請填寫正確電話格式";
        return;
    } else{
        document.querySelector(`[data-message="電話"]`).textContent = "";
        return; 
    }
})

//util js
function toThousands(x){
    let parts = x.toString().split(".");
    parts[0]= parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");
    return parts.join(".");
}

function validateEmail(mail) {
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return true
  }
    // alert("You have entered an invalid email address!")
    return false;
}

function validatePhone(phone) {
    if (/^[09]{2}\d{8}$/.test(phone))
     {
       return true
     }
       // alert("You have entered an invalid email address!")
       return false;
   }