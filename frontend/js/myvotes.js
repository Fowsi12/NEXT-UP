/* DENNE SIDE ER TIL MY VOTES 
DEN STYRER FUNKTIONERNE UNDO, DELETE ALL OG CONFIRM VOTES */

/* TO DO: RYD OP PÅ DENNE SIDE FAY!!!!!!! */

const myVotesList = document.getElementById("myVotes");

        function vote (song){
            const li = document.createElement("li");
            li.textContent = song;
            myVotesList.appendChild(li); /*appendChild betyder(tilføj noget inde i noget andet til sidst*/
        }

        function removeSong(button){
            const li = button.parentElement;
            li.remove();
        }
    /*slet sang fra listen*/
    function removeSong(button){
        const li = button.parentElement.parentElement;
        li.remove(); 
    }
    //fortryd sidste vote
    function undoLastVote(){
        const last = myVotesList.lastElementChild;
        if(last){
            last.remove();
        }
    }
    // bekræft
    function confirmVotes(){
        
    }