/*
I wanted to display the previous history of users on the left side of homepage 
when screen size is large and animated side bar using humberger icon for smaller screen
I completed the database logic using chat schema and also prepared frontend places for it I will add this feature soon. 
*/


//the request written by user on prompt 
// Interface correction
$(document).ready (()=>{
    $("#history-icon").click (()=>{
        $("#history-region").css ("display","block");
        $("#container").css("display","none");
    });

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
    function convertMarkdownToHTML(text) {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

// deal with written texts from textArea and post them

async function postText () {
    var userRequest=$("#text").val().trim();
    if (userRequest=="") return;
    $("#body").append(`<div class='message' id='right'>${userRequest}</div>`);
        //we can use botResponse variable imported here;
    $("#body").append (`<div class="message loader">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    </div>`);
    $("#text").val("");
    $('#text').attr('placeholder', 'Ask me any thing');

     $('#body').animate({
        scrollTop:$("#body")[0].scrollHeight 
    }, 2000);
    

    // fetch data from server
    const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        body: JSON.stringify({prompt: userRequest}),
        headers: {
            'Content-Type': 'application/json'
        }
        
    });
    if (response.ok) {
    const data = await response.json();
    const parsedData=data.bot;
    const htmlData = convertMarkdownToHTML(parsedData);


    $(".loader").remove();
    $("#body").append(`<div class="message" >${htmlData}</div>`);
    $('#body').animate({
        scrollTop: $("#body")[0].scrollHeight
    }, 2000);
    

    }else{
        console.error('Error:', response.statusText);
        setTimeout(()=>{
            $(".loader").remove();
            $("#body").append (`<div class="message" id="error" >Something went wrong!</div>`);
        },1000)
    }
}

    $("#send").click( ()=>{
        postText();
    })

    $('#text').keypress(function(e) {
        if (e.which == 13 && !e.shiftKey) { 
            e.preventDefault(); 
            postText();
        }
    });

    $(".historyCard").click(function() {
        $(this).toggleClass("expanded");
    });


// redirecting to and login page

    $("#login-icon").click(()=>{
        window.location.href = '/login';
    });

});

