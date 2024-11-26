// when the sign in button is clicked we obtain the data typed by user;
$(document).ready (()=>{
    $("#sign-in").click (()=>{
        var fName= $("#first-name").val();
        var lName= $("#last-name").val();
        var email= $("#email").val();
        var password= $("#password").val();
    })
}
)

// if the user have previous account he use this alternative

$(document).ready (()=>{
    $("#have-account").click (()=>{
        $("#have-account").css("display","none");
        $("#sign-in").css("display","none");
        $("#region-2").css("display","none");
        $("#region-1").css("display","flex");
        $("h1").text("Login");
    })
}
)

// if the user clicked the "already have account button accidentially there is back arrow to fix this problem"
$(document).ready (()=>{
    $("#back-arrow-div").click (()=>{
        $("").append();
        $("#sign-in").append();
        $("#region-2").css("display","flex");
        $("#region-1").css("display","none");
        $("#have-account").css("display","block");
        $("#sign-in").css("display","block");
        $("h1").text("Registration");
    })
}
)


// data for login
$(document).ready (()=>{
    $("#log-in").click (()=>{
        var email= $("#email").val();
        var password= $("#password").val();
        alert(email);
    })
})