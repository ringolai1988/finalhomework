
let orderData = [];
const orderList = document.querySelector(".js-orderList");
const discardAllBtn = document.querySelector(".discardAllBtn");
function init(){
    getOrderList();
    
}
init();
function getOrderList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{ headers:{ 'Authorization': token,
    }
    })
    .then(function(response){
        orderData = response.data.orders;
    
        let str ='';
        orderData.forEach(function(item){
          //組時間字串
          const timeStamp = new Date(item.createdAt*1000);
          const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
          
         //組產品字串
         let productStr = "";  
         item.products.forEach(function(productItem){
            productStr += `<p>${productItem.title}x${productItem.quantity}<\p>`
            })
            //判斷訂單處理狀態
            let orderStatus="";
            if(item.paid == true){
                orderStatus="已處理"
            }else{
                orderStatus="未處理"
            }

            //組訂單字串
            str += `<tr>
            <td>${item.id}</td>
            <td>
              <p>${item.user.name}</p>
              <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>${productStr}</td>
            <td>${orderTime}</td>
            <td class="js-orderStatus">
              <a href="#" class="orderStatus" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}"value="刪除">
            </td>
        </tr>`
        })
        orderList.innerHTML = str;
        // renderC3();
        renderC3_lv2();
    })
}


orderList.addEventListener("click",function(e){
    e.preventDefault();
    
    const targetClass = e.target.getAttribute("class");
    let id = e.target.getAttribute("data-id");

    if(targetClass === "delSingleOrder-Btn js-orderDelete"  ){
        deleteOrderItem(id);
        return;
    }
    if( targetClass ==="orderStatus"){
        let status = e.target.getAttribute("data-status");
       
       changeOrderItem(status,id); 
       return; 
    }
})


function changeOrderItem(status,id){
    console.log(status,id);
    let newStatus;
    if(status==true){
        newStatus=false;
    }else if(status==false){
        newStatus=true;
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{ "data": {
            "id": id,
            "paid": newStatus
          }
    },{ headers:{ 'Authorization': token,
    }
    })
    .then(function(response){
    alert("修改訂單狀態成功"); 
    getOrderList();
    })
}

function deleteOrderItem(id){
    console.log(id);
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,
{ headers:{ 'Authorization': token,
}
})
.then(function(response){
alert("刪除訂單成功"); 
getOrderList();
})
}


discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    deleteAllItem();
    return;

})


function deleteAllItem(){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
{ headers:{ 'Authorization': token,
}
})
.then(function(response){
alert("刪除全部訂單成功"); 
getOrderList();
})
}

function renderC3(){
    console.log(orderData);
    //物件資料蒐集
    let total = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(total[productItem.category] == undefined){
                total[productItem.category] = productItem.price*productItem.quantity;
            }else{
                total[productItem.category] += productItem.price*productItem.quantity;
            }
        })
    })
    console.log(total);

    let categoryAry = Object.keys(total);

    let newData = [];
    categoryAry.forEach(function(item){
        let ary =[];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    })
    console.log(newData);
    
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,
            // colors:{
            //     "Louvre 雙人床架":"#DACBFF",
            //     "Antony 雙人床架":"#9D7FEA",
            //     "Anty 雙人床架": "#5434A7",
            //     "其他": "#301E5F",
            // }
        },
    });

}

function renderC3_lv2(){
    let obj = {};
    orderData.forEach(function (item){
        item.products.forEach(function(productItem){
            if(obj[productItem.title]===undefined){
                obj[productItem.title] = productItem.quantity * productItem.price;
            }else {
                obj[productItem.title] += productItem.quantity * productItem.price;
            }
        })
    });
    let originAry = Object.keys(obj);
    console.log(originAry);
    let rankSortAry = [];

    originAry.forEach(function (item){
        let ary = [];
        ary.push(item);
        ary.push(obj[item]);
        rankSortAry.push(ary);
    });
    console.log(rankSortAry);

    rankSortAry.sort(function(a,b){
        return b[1] - a[1];
    })

    if(rankSortAry.length > 3){
        let otherTotal = 0;
        rankSortAry.forEach(function (item,index){
            if(index >2){
                otherTotal += rankSortAry[index][1];
            }
        })
        rankSortAry.splice(3,rankSortAry.length-1);
        rankSortAry.push(['其他',otherTotal]);
    }

    c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: rankSortAry,
            // colors:{
            //     "Louvre 雙人床架":"#DACBFF",
            //     "Antony 雙人床架":"#9D7FEA",
            //     "Anty 雙人床架": "#5434A7",
            //     "其他": "#301E5F",
            // }
        },
    });

}


