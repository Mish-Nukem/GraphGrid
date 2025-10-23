//<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
export class Images {
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    static _images = null;
    static get images() {
        return Images.getImages();
    }
    static getImages() {
        if (Images._images) return Images._images;

        Images._outerImagesDict = Images._outerImagesDict || {};

        const images = {};
        images.filterSelect = (w, h) => {
            const oi = Images._outerImagesDict['filterSelect'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 512 450">
                        <path d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z" />
                    </svg>
            )
        };

        images.selectFilterValue = (w, h) => {
            const oi = Images._outerImagesDict['selectFilterValue'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 512 512">
                        <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM96 96l320 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L96 160c-17.7 0-32-14.3-32-32s14.3-32 32-32z" />
                    </svg>
            )
        };

        images.filterClear = (w, h) => {
            const oi = Images._outerImagesDict['filterClear'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 400 512">
                        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                    </svg>
            )
        };

        images.addRecord = (w, h) => {
            const oi = Images._outerImagesDict['addRecord'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 448 512">
                        <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" />
                    </svg>
            )
        };

        images.copyRecord = (w, h) => {
            const oi = Images._outerImagesDict['copyRecord'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 448 512">
                        <path d="M208 0L332.1 0c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9L448 336c0 26.5-21.5 48-48 48l-192 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48zM48 128l80 0 0 64-64 0 0 256 192 0 0-32 64 0 0 48c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 176c0-26.5 21.5-48 48-48z" />
                    </svg>
            )
        };

        images.deleteRecord = (w, h) => {
            const oi = Images._outerImagesDict['deleteRecord'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 448 512">
                        <path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" />
                    </svg>
            )
        };

        images.viewRecord = (w, h) => {
            const oi = Images._outerImagesDict['viewRecord'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 512 512">
                        <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                    </svg>
            )
        };

        images.commit = (w, h) => {
            const oi = Images._outerImagesDict['commit'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 448 512">
                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                    </svg>
            )
        };

        images.rollback = (w, h) => {
            const oi = Images._outerImagesDict['rollback'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 512 512">
                        <path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" />
                    </svg>
            )
        };

        images.edit = (w, h) => {
            const oi = Images._outerImagesDict['edit'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 512 512">
                        <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z" />
                    </svg>
            )
        };

        images.refresh = (w, h) => {
            const oi = Images._outerImagesDict['refresh'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 512 512">
                        <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l111.5 0c0 0 0 0 0 0l.4 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1L16 432c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.1 17.6 17.5c0 0 0 0 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352l34.4 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L48.4 288c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z" />
                    </svg>
            )
        };

        images.settings = (w, h) => {
            const oi = Images._outerImagesDict['settings'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 512 512">
                        <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
                    </svg>
            )
        };

        images.first = (w, h) => {
            const oi = Images._outerImagesDict['first'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 512 512">
                        <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160zm352-160l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L301.3 256 438.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0z" />
                    </svg>
            )
        };

        images.prev = (w, h) => {
            const oi = Images._outerImagesDict['prev'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 320 512">
                        <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
                    </svg>
            )
        };

        images.next = (w, h) => {
            const oi = Images._outerImagesDict['next'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 320 512">
                        <path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z" />
                    </svg>
            )
        };

        images.last = (w, h) => {
            const oi = Images._outerImagesDict['last'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 512 512">
                        <path d="M470.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 256 265.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160zm-352 160l160-160c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L210.7 256 73.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z" />
                    </svg>
            )
        };

        images.clear = (w, h) => {
            const oi = Images._outerImagesDict['clear'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 512 512">
                        <path d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z" />
                    </svg>
            )
        };

        images.caretUp = (w, h) => {
            const oi = Images._outerImagesDict['caretUp'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 320 512">
                        <path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l256 0c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z" />
                    </svg>
            )
        };

        images.caretDown = (w, h) => {
            const oi = Images._outerImagesDict['caretDown'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 320 512">
                        <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z" />
                    </svg>
            )
        };

        images.caretLeft = (w, h) => {
            const oi = Images._outerImagesDict['caretLeft'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 320 512">
                        <path d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z" />
                    </svg>
            )
        };

        images.caretRight = (w, h) => {
            const oi = Images._outerImagesDict['caretRight'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 320 512">
                        <path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z" />
                    </svg>
            )
        };

        images.rightLeft = (w, h) => {
            const oi = Images._outerImagesDict['rightLeft'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "28"} height={h || "20"} fill="currentColor" viewBox="0 0 320 512" style={{ marginLeft: "-3px" }}>
                        <path d="M438.6 150.6c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.7 96 32 96C14.3 96 0 110.3 0 128s14.3 32 32 32l306.7 0-41.4 41.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l96-96zm-333.3 352c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 416 416 416c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0 41.4-41.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3l96 96z" />
                    </svg>
            )
        };

        images.test = (w, h) => {
            const oi = Images._outerImagesDict['test'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "28"} height={h || "20"} fill="currentColor" viewBox="100 0 320 512" style={{ marginLeft: "-3px" }}>
                        <path d="M342.6 9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4L28.1 342.6C10.1 360.6 0 385 0 410.5L0 416c0 53 43 96 96 96l5.5 0c25.5 0 49.9-10.1 67.9-28.1L448 205.3l9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-32-32-96-96-32-32zM205.3 256L352 109.3 402.7 160l-96 96-101.5 0z" />
                    </svg>
            )
        };

        images.save = (w, h) => {
            const oi = Images._outerImagesDict['save'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 512 512">
                        <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-242.7c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32L64 32zm0 96c0-17.7 14.3-32 32-32l192 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32L96 224c-17.7 0-32-14.3-32-32l0-64zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                    </svg>
            )
        };

        images.chevronUp = (w, h) => {
            const oi = Images._outerImagesDict['chevronUp'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 320 512">
                        <path d="M297.4 169.4C309.9 156.9 330.2 156.9 342.7 169.4L534.7 361.4C547.2 373.9 547.2 394.2 534.7 406.7C522.2 419.2 501.9 419.2 489.4 406.7L320 237.3L150.6 406.6C138.1 419.1 117.8 419.1 105.3 406.6C92.8 394.1 92.8 373.8 105.3 361.3L297.3 169.3z" />
                    </svg>
            )
        };

        images.chevronDown = (w, h) => {
            const oi = Images._outerImagesDict['chevronDown'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 320 512">
                        <path d="M297.4 470.6C309.9 483.1 330.2 483.1 342.7 470.6L534.7 278.6C547.2 266.1 547.2 245.8 534.7 233.3C522.2 220.8 501.9 220.8 489.4 233.3L320 402.7L150.6 233.4C138.1 220.9 117.8 220.9 105.3 233.4C92.8 245.9 92.8 266.2 105.3 278.7L297.3 470.7z" />
                    </svg>
            )
        };

        images.question = (w, h) => {
            const oi = Images._outerImagesDict['question'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 320 512">
                        <path d="M224 224C224 171 267 128 320 128C373 128 416 171 416 224C416 266.7 388.1 302.9 349.5 315.4C321.1 324.6 288 350.7 288 392L288 416C288 433.7 302.3 448 320 448C337.7 448 352 433.7 352 416L352 392C352 390.3 352.6 387.9 355.5 384.7C358.5 381.4 363.4 378.2 369.2 376.3C433.5 355.6 480 295.3 480 224C480 135.6 408.4 64 320 64C231.6 64 160 135.6 160 224C160 241.7 174.3 256 192 256C209.7 256 224 241.7 224 224zM320 576C342.1 576 360 558.1 360 536C360 513.9 342.1 496 320 496C297.9 496 280 513.9 280 536C280 558.1 297.9 576 320 576z" />
                    </svg>
            )
        };

        images.folderTree = (w, h) => {
            const oi = Images._outerImagesDict['folderTree'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "25"} height={h || "20"} fill="currentColor" viewBox="0 0 800 600">
                        <path d="M80 88C80 74.7 69.3 64 56 64C42.7 64 32 74.7 32 88L32 456C32 486.9 57.1 512 88 512L272 512L272 464L88 464C83.6 464 80 460.4 80 456L80 224L272 224L272 176L80 176L80 88zM368 288L560 288C586.5 288 608 266.5 608 240L608 144C608 117.5 586.5 96 560 96L477.3 96C468.8 96 460.7 92.6 454.7 86.6L446.1 78C437.1 69 424.9 63.9 412.2 63.9L368 64C341.5 64 320 85.5 320 112L320 240C320 266.5 341.5 288 368 288zM368 576L560 576C586.5 576 608 554.5 608 528L608 432C608 405.5 586.5 384 560 384L477.3 384C468.8 384 460.7 380.6 454.7 374.6L446.1 366C437.1 357 424.9 351.9 412.2 351.9L368 352C341.5 352 320 373.5 320 400L320 528C320 554.5 341.5 576 368 576z" />
                    </svg>
            )
        };

        images.link = (w, h) => {
            const oi = Images._outerImagesDict['link'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 600 600">
                        <path d="M451.5 160C434.9 160 418.8 164.5 404.7 172.7C388.9 156.7 370.5 143.3 350.2 133.2C378.4 109.2 414.3 96 451.5 96C537.9 96 608 166 608 252.5C608 294 591.5 333.8 562.2 363.1L491.1 434.2C461.8 463.5 422 480 380.5 480C294.1 480 224 410 224 323.5C224 322 224 320.5 224.1 319C224.6 301.3 239.3 287.4 257 287.9C274.7 288.4 288.6 303.1 288.1 320.8C288.1 321.7 288.1 322.6 288.1 323.4C288.1 374.5 329.5 415.9 380.6 415.9C405.1 415.9 428.6 406.2 446 388.8L517.1 317.7C534.4 300.4 544.2 276.8 544.2 252.3C544.2 201.2 502.8 159.8 451.7 159.8zM307.2 237.3C305.3 236.5 303.4 235.4 301.7 234.2C289.1 227.7 274.7 224 259.6 224C235.1 224 211.6 233.7 194.2 251.1L123.1 322.2C105.8 339.5 96 363.1 96 387.6C96 438.7 137.4 480.1 188.5 480.1C205 480.1 221.1 475.7 235.2 467.5C251 483.5 269.4 496.9 289.8 507C261.6 530.9 225.8 544.2 188.5 544.2C102.1 544.2 32 474.2 32 387.7C32 346.2 48.5 306.4 77.8 277.1L148.9 206C178.2 176.7 218 160.2 259.5 160.2C346.1 160.2 416 230.8 416 317.1C416 318.4 416 319.7 416 321C415.6 338.7 400.9 352.6 383.2 352.2C365.5 351.8 351.6 337.1 352 319.4C352 318.6 352 317.9 352 317.1C352 283.4 334 253.8 307.2 237.5z" />
                    </svg>
            )
        };

        images.report = (w, h) => {
            const oi = Images._outerImagesDict['report'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 50 512 512">
                        <path d="M96 96C113.7 96 128 110.3 128 128L128 464C128 472.8 135.2 480 144 480L544 480C561.7 480 576 494.3 576 512C576 529.7 561.7 544 544 544L144 544C99.8 544 64 508.2 64 464L64 128C64 110.3 78.3 96 96 96zM192 160C192 142.3 206.3 128 224 128L416 128C433.7 128 448 142.3 448 160C448 177.7 433.7 192 416 192L224 192C206.3 192 192 177.7 192 160zM224 240L352 240C369.7 240 384 254.3 384 272C384 289.7 369.7 304 352 304L224 304C206.3 304 192 289.7 192 272C192 254.3 206.3 240 224 240zM224 352L480 352C497.7 352 512 366.3 512 384C512 401.7 497.7 416 480 416L224 416C206.3 416 192 401.7 192 384C192 366.3 206.3 352 224 352z" />
                    </svg>
            )
        };

        images.pocket = (w, h) => {
            const oi = Images._outerImagesDict['pocket'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 40 600 512">
                        <path d="M465.4 192L431.1 144L209 144L174.7 192L465.4 192zM96 212.5C96 199.2 100.2 186.2 107.9 175.3L156.9 106.8C168.9 90 188.3 80 208.9 80L431 80C451.7 80 471.1 90 483.1 106.8L532 175.3C539.8 186.2 543.9 199.2 543.9 212.5L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 212.5z" />
                    </svg>
            )
        };

        images.pocketOpened = (w, h) => {
            const oi = Images._outerImagesDict['pocketOpened'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 40 600 512">
                        <path d="M560.3 301.2C570.7 313 588.6 315.6 602.1 306.7C616.8 296.9 620.8 277 611 262.3L563 190.3C560.2 186.1 556.4 182.6 551.9 180.1L351.4 68.7C332.1 58 308.6 58 289.2 68.7L88.8 180C83.4 183 79.1 187.4 76.2 192.8L27.7 282.7C15.1 306.1 23.9 335.2 47.3 347.8L80.3 365.5L80.3 418.8C80.3 441.8 92.7 463.1 112.7 474.5L288.7 574.2C308.3 585.3 332.2 585.3 351.8 574.2L527.8 474.5C547.9 463.1 560.2 441.9 560.2 418.8L560.2 301.3zM320.3 291.4L170.2 208L320.3 124.6L470.4 208L320.3 291.4zM278.8 341.6L257.5 387.8L91.7 299L117.1 251.8L278.8 341.6z" />
                    </svg>
            )
        };

        images.newImage = (w, h) => {
            const oi = Images._outerImagesDict['newImage'];
            return (
                oi ?
                    <div dangerouslySetInnerHTML={{ __html: oi }} className="image-container-div"></div>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width={w || "20"} height={h || "20"} fill="currentColor" viewBox="0 0 320 512">

                    </svg>
            )
        };

        Images._images = images;
        return Images._images;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}