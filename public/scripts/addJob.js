let date = new Date();
date.setHours(0, 0, 0, 0);
document.querySelector("#jobDate").valueAsDate = date;

let currYear = parseInt(new Date().getFullYear());
for(i = 1990; i <= currYear; i++) {
    let ele =  `<option value="${i}">${i}</option>`;
    document.querySelector("#Add-Job #year").insertAdjacentHTML("beforeend", ele);
}

let newTireInput = `
<div class="row bg-light m-1 p-1 new-tire">
    <div class="col-1">
        <input type="number" name="tire-qty" id="tire-qty" class="form-control"/>
    </div>
    <div class="col-2">
        <input type="text" name="tire-name" id="tire-name" class="form-control"/>
    </div>
    <div class="col-6 d-flex align-items-center">
        <input type="text" name="tire-desc" id="tire-desc" class="form-control"/>
    </div>
    <div class="col-2 d-flex align-items-center">
        <input type="text" name="tire-price" id="tire-price" class="form-control"/>
    </div>
    <div class="col-1">
        <button type="button" onclick="removeNewTire(event)" id="delete-job-tire" class="btn btn-danger">
            <i class="fa-solid fa-trash"></i>
        </button>
    </div>
</div>
`;

document.querySelector("#add-job-tire-btn").addEventListener('click', function() {
    document.querySelector("#add-job-tire").insertAdjacentHTML('beforeend', newTireInput);
});

function removeNewTire(eve) {
    eve.preventDefault
    eve.target.closest(".new-tire").remove();
}