const el = document.getElementById("save-text");

el.onclick = function() {
    console.log("button clicked");
    console.log(chrome.storage);
    //await browser.cookies.set({
    //    name: "cover_letter_saved_data",
    //    value: JSON.stringify({ text: 'test' }),
    //    url: "www.upwork.com"
    //});

    //browser.cookies.get({
    //    name: "cover_letter_saved_data",
    //    url: "www.upwork.com"
    //}).then(c => {
    //    console.log("wbub");
    //});


}
