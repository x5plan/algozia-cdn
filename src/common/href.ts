$(function () {
    $("a[href-post]")
        .on("click", (e) => {
            e.preventDefault();

            const form = document.createElement("form");
            form.style.display = "none";
            form.method = "post";
            form.action = $(e.currentTarget).attr("href-post")!;
            form.target = "_self";
            document.body.appendChild(form);
            form.submit();
        })
        .on("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                $(e.currentTarget).trigger("click");
            }
        });
});
