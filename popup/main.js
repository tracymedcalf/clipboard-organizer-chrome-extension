const el = document.getElementById("save-text");

el.onclick = async function() {
    console.log("button clicked");
    await browser.cookies.set({
        name: "cover_letter_saved_data",
        value: JSON.stringify({ text: 'test' }),
        url: "www.upwork.com"
    });

    //browser.cookies.get({
    //    name: "cover_letter_saved_data",
    //    url: "www.upwork.com"
    //}).then(c => {
    //    console.log("wbub");
    //});


}
