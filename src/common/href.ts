$(function () {
    $(document).on("click", "a[href-post]", (e) => {
        e.preventDefault();

        const form = document.createElement("form");
        form.style.display = "none";
        form.method = "post";
        form.action = $(e.target).attr("href-post")!;
        form.target = "_self";
        document.body.appendChild(form);
        form.submit();
    });

    $(document).on("click", "a[href-delete]", (e) => {
        e.preventDefault();

        const form = document.createElement("form");
        form.style.display = "none";
        form.method = "delete";
        form.action = $(e.target).attr("href-delete")!;
        form.target = "_self";
        document.body.appendChild(form);
        form.submit();
    });
});
