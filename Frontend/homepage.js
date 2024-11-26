// Interface correction
$(document).ready (()=>{
    $("#history-icon").click (()=>{
        $("#history-region").css ("display","block");
        $("#container").css("display","none");
    });
});


$(document).ready (()=>{
    $("#back-icon").click (()=>{
        var screenWidth=$(window).width();
        if (screenWidth>=900){
         $("#history-region").css ("display","block");
            }
        else{
         $("#history-region").css ("display","none");
        }     
        $("#container").css("display","block");
    });
});

// deal with written texts from textArea and post them
$(document).ready (()=>{
    $("#send").click(()=>{
        var userRequest=$("#text").val();
        $("#body").append(`<div class='message' id='right'>${userRequest}</div>`);
    })
})