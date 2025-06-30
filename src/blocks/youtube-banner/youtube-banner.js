import './youtube-banner.css';

export default function decorate(block) {


    const ytBannerInner = document.createElement('div');
    ytBannerInner.classList.add('youtube-banner__inner');

    [...block.children].forEach((row) => {
        const div = row.querySelectorAll('div');

        const youtubeVideLinkId = div[0].innerText.trim().replace(/https?:\/\/(www\.)?youtube\.com\/watch\?v=|https?:\/\/youtu\.be\//, '').trim();

        const bannerText = div[1].innerHTML

        const bannerHtml = `
            <div class="youtube-banner__video">

                <iframe title="Youtube video" src="https://www.youtube.com/embed/${youtubeVideLinkId}" allowfullscreen frameborder="0"></iframe>
            </div>
            <div class="youtube-banner__text">
                    ${bannerText}
            </div>
        `

        ytBannerInner.innerHTML = bannerHtml;

    });


    block.innerHTML = '';
    block.appendChild(ytBannerInner);
}
