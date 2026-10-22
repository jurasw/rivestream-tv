(function () {
  'use strict';
  if (window.RiveTVPlayer) return;
  var root = window === window.top;
  var TRACK = 1318, RATES = [.5,.75,1,1.25,1.5];
  var icons = {
    play:'<svg viewBox="0 0 52 52"><path d="M39.5561 24.4165C41.1467 25.4272 41.1292 27.7546 39.5237 28.7413L12.8852 45.1123C11.1861 46.1565 9 44.934 9 42.9398L9 9.64164C9 7.63021 11.2199 6.41063 12.9176 7.4894L39.5561 24.4165Z" fill="currentColor"/></svg>',
    pause:'<svg viewBox="0 0 52 52"><rect x="12" y="8" width="11" height="36" rx="2.5" fill="currentColor"/><rect x="29" y="8" width="11" height="36" rx="2.5" fill="currentColor"/></svg>',
    back10:'<svg viewBox="0 0 52 52"><path d="M20.0644 35.8091V26.152L17.2505 27.0331V25.0118L22.3018 23.5607V35.8091H20.0644Z" fill="currentColor"/><path d="M30.8162 36.0682C29.867 36.0682 29.0364 35.8148 28.3245 35.3081C27.6126 34.7898 27.0588 34.0642 26.6633 33.1314C26.2791 32.187 26.087 31.0756 26.087 29.7972C26.087 28.5303 26.2791 27.4246 26.6633 26.4802C27.0588 25.5358 27.6126 24.8103 28.3245 24.3035C29.0364 23.7852 29.867 23.5261 30.8162 23.5261C31.7655 23.5261 32.596 23.7852 33.308 24.3035C34.0199 24.8103 34.568 25.5358 34.9522 26.4802C35.3477 27.4246 35.5455 28.5303 35.5455 29.7972C35.5455 31.0756 35.3477 32.187 34.9522 33.1314C34.568 34.0642 34.0199 34.7898 33.308 35.3081C32.596 35.8148 31.7655 36.0682 30.8162 36.0682ZM30.8162 34.0297C31.5621 34.0297 32.1553 33.6554 32.596 32.9068C33.0481 32.1582 33.2741 31.1216 33.2741 29.7972C33.2741 28.4727 33.0481 27.4362 32.596 26.6876C32.1553 25.9389 31.5621 25.5646 30.8162 25.5646C30.0704 25.5646 29.4715 25.9389 29.0195 26.6876C28.5787 27.4362 28.3584 28.4727 28.3584 29.7972C28.3584 31.1216 28.5787 32.1582 29.0195 32.9068C29.4715 33.6554 30.0704 34.0297 30.8162 34.0297Z" fill="currentColor"/><path d="M31.3671 4.7734L27.5689 9.11171C29.1468 9.37378 30.824 9.78842 32.4417 10.3366C34.9692 11.1932 37.4714 12.4161 39.2291 13.996C42.5924 17.0191 44.8612 21.1065 45.6711 25.6018C46.481 30.0971 45.7851 34.7394 43.695 38.7831C41.605 42.8268 38.2422 46.0373 34.1466 47.899C30.051 49.7607 25.4604 50.1655 21.1119 49.0485C16.7635 47.9315 12.9095 45.3574 10.169 41.7397C7.42854 38.1219 5.96054 33.6705 6.0008 29.1002C6.00728 28.3647 6.59758 27.7738 7.31926 27.7804C8.04095 27.787 8.62074 28.3886 8.61426 29.1241C8.57926 33.0972 9.85542 36.9669 12.2378 40.1119C14.6201 43.2569 17.9705 45.4946 21.7507 46.4656C25.5309 47.4367 29.5217 47.0848 33.082 45.4663C36.6424 43.8479 39.5658 41.057 41.3827 37.5417C43.1996 34.0264 43.8046 29.9908 43.1005 26.0829C42.3964 22.175 40.4241 18.6218 37.5003 15.9937C36.1145 14.748 33.9833 13.6661 31.617 12.8642C30.4727 12.4764 29.3015 12.1636 28.1741 11.9316L31.3657 15.6642L29.3954 17.4142L23.9278 11.0199C23.4952 10.514 23.4996 9.75898 23.938 9.25822L29.417 3L31.3671 4.7734ZM23.7531 4.67737L19.4657 10.11L23.7596 15.1221L21.7909 16.874L16.7766 11.021C16.3599 10.5346 16.3456 9.81353 16.7427 9.31033L21.7165 3.00794L23.7531 4.67737Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/></svg>',
    fwd10:'<svg viewBox="0 0 52 52"><path d="M19.2684 35.8091V26.152L16.4545 27.0331V25.0118L21.5058 23.5607V35.8091H19.2684Z" fill="currentColor"/><path d="M30.0202 36.0682C29.071 36.0682 28.2404 35.8148 27.5285 35.3081C26.8166 34.7898 26.2628 34.0642 25.8673 33.1314C25.4831 32.187 25.291 31.0756 25.291 29.7972C25.291 28.5303 25.4831 27.4246 25.8673 26.4802C26.2628 25.5358 26.8166 24.8103 27.5285 24.3035C28.2404 23.7852 29.071 23.5261 30.0202 23.5261C30.9695 23.5261 31.8 23.7852 32.512 24.3035C33.2239 24.8103 33.772 25.5358 34.1562 26.4802C34.5517 27.4246 34.7495 28.5303 34.7495 29.7972C34.7495 31.0756 34.5517 32.187 34.1562 33.1314C33.772 34.0642 33.2239 34.7898 32.512 35.3081C31.8 35.8148 30.9695 36.0682 30.0202 36.0682ZM30.0202 34.0297C30.7661 34.0297 31.3593 33.6554 31.8 32.9068C32.2521 32.1582 32.4781 31.1216 32.4781 29.7972C32.4781 28.4727 32.2521 27.4362 31.8 26.6876C31.3593 25.9389 30.7661 25.5646 30.0202 25.5646C29.2744 25.5646 28.6755 25.9389 28.2235 26.6876C27.7827 27.4362 27.5624 28.4727 27.5624 29.7972C27.5624 31.1216 27.7827 32.1582 28.2235 32.9068C28.6755 33.6554 29.2744 34.0297 30.0202 34.0297Z" fill="currentColor"/><path d="M20.6329 4.7734L24.4311 9.11171C22.8532 9.37378 21.176 9.78842 19.5583 10.3366C17.0308 11.1932 14.5286 12.4161 12.7709 13.996C9.40763 17.0191 7.13885 21.1065 6.32892 25.6018C5.51899 30.0971 6.21493 34.7394 8.30495 38.7831C10.395 42.8268 13.7578 46.0373 17.8534 47.899C21.949 49.7607 26.5396 50.1655 30.8881 49.0485C35.2365 47.9315 39.0905 45.3574 41.831 41.7397C44.5715 38.1219 46.0395 33.6705 45.9992 29.1002C45.9927 28.3647 45.4024 27.7738 44.6807 27.7804C43.959 27.787 43.3793 28.3886 43.3857 29.1241C43.4207 33.0972 42.1446 36.9669 39.7622 40.1119C37.3799 43.2568 34.0295 45.4945 30.2493 46.4656C26.4691 47.4367 22.4783 47.0847 18.918 45.4663C15.3576 43.8479 12.4342 41.057 10.6173 37.5417C8.8004 34.0264 8.19541 29.9907 8.8995 26.0829C9.60359 22.175 11.5759 18.6217 14.4997 15.9937C15.8855 14.7479 18.0167 13.6661 20.383 12.8642C21.5273 12.4764 22.6985 12.1636 23.8259 11.9316L20.6343 15.6642L22.6046 17.4142L28.0722 11.0199C28.5048 10.514 28.5004 9.75898 28.062 9.25822L22.583 3L20.6329 4.7734ZM28.2469 4.67737L32.5343 10.11L28.2404 15.1221L30.2091 16.874L35.2234 11.021C35.6401 10.5346 35.6544 9.81352 35.2573 9.31033L30.2835 3.00794L28.2469 4.67737Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"/></svg>',
    volume:'<svg viewBox="0 0 52 52"><path d="M25.2292 10.3911C24.9142 10.2549 24.5687 10.2046 24.228 10.2455C23.8872 10.2864 23.5634 10.417 23.2896 10.6239L14.0187 17.9552H6.93952C6.42512 17.9552 5.9318 18.1596 5.56807 18.5233C5.20434 18.887 5 19.3804 5 19.8948V31.5319C5 32.0462 5.20434 32.5396 5.56807 32.9033C5.9318 33.267 6.42512 33.4714 6.93952 33.4714H14.0187L23.1927 40.8027C23.5339 41.0765 23.9577 41.2269 24.3952 41.2294C24.6849 41.2342 24.9713 41.1676 25.2292 41.0355C25.5592 40.8783 25.8381 40.631 26.0337 40.3222C26.2293 40.0133 26.3336 39.6555 26.3347 39.2899V12.1367C26.3336 11.7711 26.2293 11.4133 26.0337 11.1044C25.8381 10.7956 25.5592 10.5483 25.2292 10.3911ZM22.4556 35.2557L15.9001 30.019C15.5588 29.7453 15.1351 29.5949 14.6976 29.5923H8.87903V21.8343H14.6976C15.1351 21.8317 15.5588 21.6814 15.9001 21.4076L22.4556 16.1709V35.2557Z" fill="currentColor"/><path d="M30.4677 41.1884C30.4677 41.7819 30.9495 42.2666 31.5417 42.2281C35.5342 41.9684 39.3115 40.2671 42.1578 37.4208C45.2582 34.3204 47 30.1154 47 25.7307C47 21.3461 45.2582 17.1411 42.1578 14.0407C39.3115 11.1944 35.5342 9.49313 31.5417 9.23338C30.9495 9.19485 30.4677 9.6796 30.4677 10.2731C30.4677 10.8666 30.9495 11.3435 31.5414 11.3878C34.9634 11.6438 38.195 13.1172 40.6381 15.5604C43.3355 18.2577 44.8508 21.9161 44.8508 25.7307C44.8508 29.5454 43.3355 33.2038 40.6381 35.9011C38.195 38.3443 34.9634 39.8177 31.5414 40.0737C30.9495 40.118 30.4677 40.5949 30.4677 41.1884Z" fill="currentColor"/><path d="M30.4663 32.9631C30.4663 33.5338 30.9307 34.003 31.4969 33.9319C33.3092 33.7042 35.0061 32.8805 36.3113 31.5753C37.8615 30.0251 38.7324 27.9226 38.7324 25.7302C38.7324 23.5379 37.8615 21.4354 36.3113 19.8852C35.0061 18.5799 33.3092 17.7563 31.4969 17.5286C30.9307 17.4574 30.4663 17.9267 30.4663 18.4974C30.4663 19.068 30.9321 19.5219 31.4948 19.6165C32.7575 19.829 33.9327 20.4291 34.8501 21.3465C36.0127 22.5091 36.6659 24.086 36.6659 25.7302C36.6659 27.3745 36.0127 28.9514 34.8501 30.114C33.9327 31.0314 32.7575 31.6315 31.4948 31.844C30.9321 31.9386 30.4663 32.3924 30.4663 32.9631Z" fill="currentColor"/><path d="M30.468 37.0777C30.468 37.6598 30.9408 38.1363 31.5208 38.0869C34.4235 37.8397 37.1597 36.5759 39.2355 34.5C41.5608 32.1747 42.8672 29.0209 42.8672 25.7324C42.8672 22.444 41.5608 19.2902 39.2355 16.9649C37.1597 14.889 34.4235 13.6252 31.5208 13.378C30.9408 13.3286 30.468 13.8051 30.468 14.3872C30.468 14.9693 30.9411 15.4355 31.5201 15.495C33.863 15.7357 36.0647 16.775 37.7451 18.4554C39.6751 20.3854 40.7593 23.003 40.7593 25.7324C40.7593 28.4619 39.6751 31.0795 37.7451 33.0095C36.0647 34.6899 33.863 35.7292 31.5201 35.9699C30.9411 36.0294 30.468 36.4956 30.468 37.0777Z" fill="currentColor"/></svg>',
    mute:'<svg viewBox="0 0 52 52"><path d="M27.2305 10.1595C26.9155 10.0232 26.57 9.97293 26.2292 10.0138C25.8884 10.0547 25.5646 10.1853 25.2908 10.3922L16.0193 17.7241H8.93964C8.42522 17.7241 7.93186 17.9284 7.56811 18.2922C7.20435 18.6559 7 19.1493 7 19.6637V31.3015C7 31.816 7.20435 32.3093 7.56811 32.6731C7.93186 33.0368 8.42522 33.2412 8.93964 33.2412H16.0193L25.1938 40.573C25.5351 40.8468 25.9589 40.9972 26.3964 40.9998C26.6861 41.0045 26.9726 40.9379 27.2305 40.8058C27.5605 40.6486 27.8395 40.4013 28.0351 40.0924C28.2307 39.7836 28.335 39.4257 28.3361 39.0601V11.9051C28.335 11.5395 28.2307 11.1817 28.0351 10.8728C27.8395 10.564 27.5605 10.3167 27.2305 10.1595ZM24.4568 35.0257L17.9008 29.7886C17.5595 29.5148 17.1357 29.3644 16.6982 29.3619H10.8793V21.6033H16.6982C17.1357 21.6008 17.5595 21.4504 17.9008 21.1766L24.4568 15.9396V35.0257ZM41.739 25.4826L45.2303 22.0107C45.4112 21.8298 45.5546 21.6151 45.6525 21.3788C45.7504 21.1425 45.8008 20.8893 45.8008 20.6335C45.8008 20.3778 45.7504 20.1245 45.6525 19.8882C45.5546 19.6519 45.4112 19.4372 45.2303 19.2564C45.0495 19.0755 44.8348 18.9321 44.5985 18.8342C44.3622 18.7363 44.109 18.6859 43.8532 18.6859C43.5974 18.6859 43.3442 18.7363 43.1079 18.8342C42.8716 18.9321 42.6569 19.0755 42.4761 19.2564L39.0041 22.7477L35.5321 19.2564C35.1669 18.8911 34.6715 18.6859 34.155 18.6859C33.6385 18.6859 33.1431 18.8911 32.7778 19.2564C32.4126 19.6216 32.2074 20.117 32.2074 20.6335C32.2074 21.1501 32.4126 21.6454 32.7778 22.0107L36.2692 25.4826L32.7778 28.9546C32.596 29.1349 32.4517 29.3494 32.3533 29.5858C32.2548 29.8222 32.2041 30.0757 32.2041 30.3317C32.2041 30.5878 32.2548 30.8413 32.3533 31.0777C32.4517 31.314 32.596 31.5286 32.7778 31.7089C32.9582 31.8907 33.1727 32.035 33.409 32.1334C33.6454 32.2319 33.8989 32.2826 34.155 32.2826C34.411 32.2826 34.6646 32.2319 34.9009 32.1334C35.1373 32.035 35.3518 31.8907 35.5321 31.7089L39.0041 28.2175L42.4761 31.7089C42.6564 31.8907 42.8709 32.035 43.1073 32.1334C43.3436 32.2319 43.5971 32.2826 43.8532 32.2826C44.1093 32.2826 44.3628 32.2319 44.5991 32.1334C44.8355 32.035 45.05 31.8907 45.2303 31.7089C45.4121 31.5286 45.5564 31.314 45.6549 31.0777C45.7534 30.8413 45.8041 30.5878 45.8041 30.3317C45.8041 30.0757 45.7534 29.8222 45.6549 29.5858C45.5564 29.3494 45.4121 29.1349 45.2303 28.9546L41.739 25.4826Z" fill="currentColor"/></svg>',
    next:'<svg viewBox="0 0 52 52"><mask id="rive-next-mask" fill="white"><path d="M36.3715 24.0871C38.015 25.0897 37.9974 27.4821 36.3393 28.4603L13.8457 41.7311C12.1459 42.734 10 41.5085 10 39.5348L10 12.5426C10 10.5521 12.1787 9.32906 13.878 10.3656L36.3715 24.0871Z"/></mask><path d="M10 12.5426L10 39.5348C10 41.5085 12.1459 42.734 13.8457 41.7311L36.3393 28.4603C37.9974 27.4821 38.015 25.0897 36.3715 24.0871L13.878 10.3656C12.1787 9.32906 10 10.5521 10 12.5426Z" stroke-width="8" stroke="currentColor" fill="none" mask="url(#rive-next-mask)"/><path d="M44 10V42" stroke-width="4" stroke="currentColor"/></svg>',
    episodes:'<svg viewBox="0 0 52 52"><mask id="rive-episodes-mask" fill="white"><path d="M3.79688 26C3.79688 24.8954 4.69231 24 5.79688 24H31.7969C32.9014 24 33.7969 24.8954 33.7969 26V41C33.7969 42.1046 32.9014 43 31.7969 43H5.79687C4.69231 43 3.79688 42.1046 3.79688 41V26Z"/></mask><path d="M5.79687 43H31.7969C32.9014 43 33.7969 42.1046 33.7969 41V26C33.7969 24.8954 32.9014 24 31.7969 24H5.79688C4.69231 24 3.79688 24.8954 3.79688 26V41C3.79688 42.1046 4.69231 43 5.79687 43Z" stroke-width="8" stroke="currentColor" fill="none" mask="url(#rive-episodes-mask)"/><path d="M11 18.5814L36.8643 18.5231C37.9793 18.5206 38.8811 19.4304 38.8687 20.5453L38.7128 34.5814" stroke-width="4" stroke="currentColor" fill="none"/><path d="M18.7969 11.1244L44.6612 11.0661C45.7762 11.0636 46.6779 11.9734 46.6656 13.0883L46.5097 27.1244" stroke-width="4" stroke="currentColor" fill="none"/></svg>',
    subtitles:'<svg viewBox="0 0 52 52" fill="none"><path d="M8.85366 9H43.1463C44.1701 9 45 9.82991 45 10.8537V34.0244C45 35.0481 44.1701 35.878 43.1463 35.878H38.0488V43.3278C38.0488 43.5119 37.8444 43.6224 37.6903 43.5217L26.4622 36.1803C26.1606 35.9831 25.8081 35.878 25.4478 35.878H8.85366C7.82991 35.878 7 35.0481 7 34.0244V10.8537C7 9.82991 7.82991 9 8.85366 9Z" stroke-width="3.70732" stroke="currentColor"/><path d="M13 18H22M30 26H39M26 18H38.5M13 26H25.5" stroke-width="4" stroke="currentColor"/></svg>',
    speed:'<svg viewBox="0 0 52 52" fill="none"><path d="M40.5058 45.2653C43.876 42.2488 46.2589 38.2866 47.3435 33.8956C48.4281 29.5045 48.1642 24.8885 46.5861 20.6497C45.008 16.4109 42.1891 12.7462 38.497 10.1335C34.8049 7.52079 30.4111 6.0815 25.8887 6.00336C21.3664 5.92522 16.9255 7.21186 13.1453 9.69544C9.36517 12.179 6.42129 15.7442 4.69771 19.926C2.97413 24.1077 2.55087 28.7118 3.48316 33.1377C4.41545 37.5636 6.65999 41.6058 9.92398 44.7369" stroke-width="4" stroke="currentColor"/><circle cx="25" cy="30" r="6" fill="currentColor"/><path d="M34.4142 20.4142L26.4142 28.4142" stroke-width="4" stroke="currentColor"/></svg>',
    arrow:'<svg viewBox="0 0 44 44" fill="none"><path d="M18 10L6 22.5L18 35" stroke-width="3" stroke-linecap="square" stroke="currentColor"/><path d="M38 22.5L7 22.5" stroke-width="3" stroke="currentColor"/></svg>',
    bigPlay:'<svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="36" fill="black" fill-opacity="0.3"/><path d="M57.8259 34.5925C59.2022 35.3621 59.1882 37.3472 57.8012 38.0973L23.9514 56.4038C22.6188 57.1245 21 56.1596 21 54.6446L21 17.4098C21 15.8824 22.643 14.9187 23.9761 15.6642L57.8259 34.5925Z" fill="white" fill-opacity="0.5"/></svg>',
    check:'<svg viewBox="0 0 18 13" fill="none"><path d="M0.369141 5.60718L6.36257 12.1403L17.5826 0.344487" stroke="currentColor"/></svg>',
    triangle:'<svg viewBox="0 0 21 24"><path d="M19.5 10.3C20.8 11.1 20.8 12.9 19.5 13.7L3 23.4C1.7 24.2 0 23.2 0 21.7V2.3C0 .8 1.7-.2 3 .6Z" fill="currentColor"/></svg>'
  };
  var css = ':host{all:initial;position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:2147483647;pointer-events:none;display:block;contain:strict}' +
    ':host([hidden]){display:none}' +
    '.stage{position:absolute;left:0;top:0;width:1440px;height:var(--h,810px);transform:scale(var(--s,1));transform-origin:0 0;overflow:hidden;color:#fff;font-family:"Rive Inter","Inter",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:16px;line-height:1.2;letter-spacing:-.01em;-webkit-font-smoothing:antialiased}' +
    '*{box-sizing:border-box}svg{display:block;width:100%;height:100%}' +
    '.off{opacity:0;visibility:hidden;transition:opacity .5s ease,visibility 0s .5s}.on{opacity:1;visibility:visible;transition:opacity .3s ease}' +
    '.scrim-top{position:absolute;left:0;right:0;top:0;height:140px;background:linear-gradient(180deg,rgba(0,0,0,.6),rgba(0,0,0,0))}' +
    '.scrim-bottom{position:absolute;left:0;right:0;bottom:0;height:240px;background:linear-gradient(0deg,rgba(0,0,0,.7) 0%,rgba(0,0,0,0) 100%)}' +
    '.bottom{position:absolute;left:0;right:0;bottom:0;height:300px;transform:translateY(8px);transition:transform .5s ease}.chrome.on .bottom{transform:none;transition-duration:.3s}' +
    '.top{position:absolute;left:30px;right:30px;top:30px;height:44px;display:flex;justify-content:space-between;align-items:center}' +
    '.chrome.compact .top,.chrome.compact .left,.chrome.compact .right,.chrome.compact .scrim-top{visibility:hidden}' +
    '.b{position:relative;display:flex;align-items:center;justify-content:center;flex:none;color:#fff;transition:transform .15s cubic-bezier(.4,0,.2,1)}' +
    '.b::before{content:"";position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.12);box-shadow:0 0 0 2.2px rgba(255,255,255,.9);opacity:0;transition:opacity .15s}' +
    '.b svg{position:relative}.b.f{transform:scale(1.385)}.b.f::before{opacity:1}' +
    '.ib{width:52px;height:52px}.ab{width:44px;height:44px}' +
    '.tb{position:relative;display:inline-flex;align-items:center;gap:12px;height:42px;padding:8px 26px;border-radius:4px;font-size:16px;line-height:24px;font-weight:500;letter-spacing:.5px;white-space:nowrap;transition:background-color .1s linear}' +
    '.tb::after{content:"";position:absolute;inset:-6px;border-radius:7px;box-shadow:0 0 0 3px #fff;opacity:0;transition:opacity .15s}.tb.f::after{opacity:1}' +
    '.tb svg{width:16px;height:18px}.ghost{background:rgba(255,255,255,.2);color:#fff}.ghost.f{background:rgba(255,255,255,.15)}' +
    '.white{background:#fff;color:#000}.white.f{background:#e5e5e5}.grey{background:rgba(109,109,110,.7);color:#fff}.grey.f{background:#fff;color:#000}' +
    '.count{background:rgba(255,255,255,.3);color:#000}.count i{position:absolute;left:0;top:0;bottom:0;width:100%;background:#fff;border-radius:4px;transform-origin:0 0;transform:scaleX(0);transition:transform 1s linear}.count span,.count svg{position:relative}' +
    '.progress{position:absolute;left:0;right:0;bottom:112px;height:20px;padding:0 20px;display:flex;align-items:center;gap:12px;transition:opacity .15s}' +
    '.line{position:relative;flex:1;height:16px}.track{position:absolute;left:0;right:0;top:4px;height:8px;background:#808080;overflow:hidden;transform:scaleY(.5);transition:transform .15s ease-out}' +
    '.track i{position:absolute;left:0;top:0;bottom:0;width:100%;transform-origin:0 0;transform:scaleX(0)}.buf{background:#d2d2d2}.played{background:#f50723}' +
    '.thumb{position:absolute;left:-8px;top:0;width:16px;height:16px;border-radius:50%;background:#f50723}.thumb i{position:absolute;inset:0;border-radius:50%;background:#f50723;transition:transform .15s}' +
    '.progress.f .track{transform:none}.progress.f .thumb i{transform:scale(1.5)}' +
    '.time{width:70px;flex:none;font-size:18px;text-align:right;white-space:nowrap}' +
    '.scrub{position:absolute;left:-122px;bottom:30px;width:245px;background:#262626;box-shadow:0 0 10px 5px rgba(0,0,0,.25);opacity:0;transition:opacity .15s ease-out}' +
    '.scrub.on2{opacity:1}.scrub div{height:112px;background:#3a3a3a center/cover no-repeat}.scrub span{display:block;height:40px;line-height:40px;font-size:18px;text-align:center}' +
    '.row{position:absolute;left:0;right:0;bottom:22px;height:90px;padding:0 20px;display:flex;align-items:center;justify-content:space-between}' +
    '.left{display:flex;gap:28px}.right{display:flex;gap:80px}.pair{display:flex;gap:40px}.pair:empty{display:none}' +
    '.title{position:absolute;left:50%;top:30px;max-width:520px;transform:translateX(-50%);font-size:20px;line-height:30px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.title b{font-weight:500}' +
    '.panel{position:absolute;right:0;bottom:94px;background:#262626;opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .15s ease-in,transform .15s ease-in,visibility 0s .15s}' +
    '.panel.open{opacity:1;visibility:visible;transform:none;transition:opacity .2s cubic-bezier(0,0,.2,1),transform .2s cubic-bezier(0,0,.2,1)}' +
    '.chrome.paneled .progress{opacity:0}' +
    '.h{font-size:30px;line-height:30px;font-weight:500}' +
    '.nextp{right:64px;width:700px;height:274px;border-radius:2px;overflow:hidden}.nextp header{height:74px;padding:0 24px;display:flex;align-items:center;justify-content:space-between}' +
    '.nextp header div{display:flex;gap:14px}.nextp .body{height:200px;padding:30px;background:#141414;display:flex;gap:30px}' +
    '.still{position:relative;flex:none;width:250px;height:140px;background:#3a3a3a center/cover no-repeat}.still svg{position:absolute;left:89px;top:34px;width:72px;height:72px}' +
    '.meta{width:360px;display:flex;flex-direction:column;gap:2px}.meta p,.ep p{margin:0}.num{display:flex;font-size:21px;line-height:25px;font-weight:500}.num span:first-child{width:34px;flex:none}' +
    '.syn{font-size:21px;line-height:25px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden}' +
    '.eps{width:760px;max-height:545px;border-radius:4px;overflow:hidden}.eps header{height:70px;padding:20px;display:flex;justify-content:space-between;align-items:center}' +
    '.eps header span+span{font-size:18px;color:#d2d2d2}.view{position:relative;max-height:475px;overflow:hidden}.list{transition:transform .2s cubic-bezier(0,0,.2,1)}' +
    '.ep{position:relative;height:85px;padding:30px 30px 0;background:#262626}.ep.cur{background:#141414}.ep.big{height:242px;background:#141414}' +
    '.ep .r1{display:flex;align-items:center;padding-left:12px;font-size:21px;line-height:25px;font-weight:500}.ep .r1 span:first-child{width:34px;flex:none}.ep .r1 span:nth-child(2){flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}' +
    '.bar{position:relative;flex:none;width:132px;height:2px;background:#808080;overflow:hidden}.bar i{position:absolute;inset:0;background:#f50723;transform-origin:0 0}' +
    '.ep .r2{display:none;gap:32px;margin-top:16px}.ep.big .r2{display:flex}.ep .syn{width:420px;font-weight:400}.ep .still svg{display:none}' +
    '.ep::after,.it::after{content:"";position:absolute;inset:0;box-shadow:inset 0 0 0 3px #fff;opacity:0}.ep.f::after,.it.f::after{opacity:1}' +
    '.tracks{width:584px;max-height:568px;border-radius:4px;display:flex;gap:4px;overflow:hidden}.col{position:relative;width:312px}.col+.col{width:268px}' +
    '.col header{height:52px;padding:12px 10px 10px 40px;font-size:22px;line-height:22px;font-weight:500}.col .view{max-height:516px;padding-bottom:20px}' +
    '.col .view::after{content:"";position:absolute;left:0;right:0;bottom:0;height:60px;background:linear-gradient(180deg,rgba(38,38,38,0),#262626);pointer-events:none}' +
    '.it{position:relative;height:56px;padding:0 20px 0 40px;font-size:20px;line-height:56px;color:#b3b3b3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.it.f{color:#fff;background:rgba(255,255,255,.1)}.it.sel{color:#fff}.it svg{position:absolute;left:15px;top:22px;width:18px;height:13px;display:none}.it.sel svg{display:block}' +
    '.speed{width:840px;height:220px}.speed .h{position:absolute;left:30px;top:24px;line-height:45px}' +
    '.rail{position:absolute;left:48px;top:92px;width:736px;height:1px;background:#979797}' +
    '.stop{position:absolute;top:0;width:0;height:0}.stop i{position:absolute;left:-8px;top:-8px;width:16px;height:16px;border-radius:50%;background:#dcdcdc}' +
    '.stop b{position:absolute;left:-26.5px;top:-26.5px;width:53px;height:53px;border-radius:50%;border:4px solid #b3b3b3;opacity:0}.stop.f b{opacity:1}.stop.f i{left:-12px;top:-12px;width:24px;height:24px;background:#fff}' +
    '.stop span{position:absolute;top:44px;left:0;transform:translateX(-50%);font-size:28px;line-height:45px;color:#e5e5e5;white-space:nowrap}.stop:first-child span{transform:translateX(-12px)}.stop:last-child span{transform:translateX(calc(-100% + 12px))}' +
    '.stop.sel span{color:#fff;font-weight:500}' +
    '.vol{left:269px;right:auto;bottom:96px;width:34px;height:146px;border-radius:2px}.vol .vt{position:absolute;left:11px;top:24px;width:12px;height:98px;background:#808080}' +
    '.vol .vf{position:absolute;inset:0;background:#f50723;transform-origin:0 100%}.vol .vk{position:absolute;left:-6px;bottom:-12px;width:24px;height:24px;border-radius:50%;background:#f50723}' +
    '.paused{position:absolute;inset:0;background:rgba(0,0,0,.5);transition:opacity .4s ease,visibility 0s .4s}.paused.on{transition:opacity .4s ease}' +
    '.paused .text{position:absolute;left:172px;top:34%;width:605px;display:flex;flex-direction:column;gap:16px}.paused p{margin:0}' +
    '.paused .eyebrow,.paused .desc,.paused .label{font-size:18px;line-height:22px;color:#d2d2d2}.paused .big{font-size:55px;line-height:1.1;font-weight:700;letter-spacing:-1px}' +
    '.paused .sub2{font-size:24px;font-weight:500;margin-top:-8px}.paused .epl{font-size:24px;font-weight:500;margin-top:20px}.paused .label{position:absolute;right:142px;bottom:72px}' +
    '.paused .desc{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden}' +
    '.intro{position:absolute;left:44px;top:40px;display:flex;flex-direction:column;gap:0;transition:opacity .5s ease,visibility 0s .5s}.intro.on{transition:opacity .3s ease}' +
    '.intro p{margin:0;font-weight:500}.intro p:first-child{font-size:20px;line-height:30px}.intro p:last-child{font-size:33px;line-height:1.2;letter-spacing:-.02em}' +
    '.spin{position:absolute;left:684px;top:50%;width:72px;height:72px;margin-top:-36px;display:none}.spin.on2{display:block}.spin svg{animation:rive-spin 1s linear infinite}' +
    '@keyframes rive-spin{to{transform:rotate(360deg)}}' +
    '.err{position:absolute;left:440px;top:50%;width:560px;padding:30px;margin-top:-110px;background:#262626;border-radius:4px;display:none}.err.on2{display:block}' +
    '.err p{margin:0 0 12px;font-size:24px;font-weight:500}.err span{display:block;font-size:18px;line-height:22px;color:#d2d2d2;margin-bottom:26px}.err div{display:flex;gap:14px}' +
    '.sub{position:absolute;left:120px;right:120px;bottom:8%;text-align:center;transition:transform .3s ease}.sub.up{transform:translateY(-150px)}' +
    '.sub span{font-size:36px;line-height:1.25;font-weight:500;white-space:pre-line;text-shadow:0 0 6px #000,0 2px 3px #000,0 0 2px #000}';
  var markup = '<div class="stage">' +
    '<div class="sub"><span></span></div>' +
    '<div class="spin"><svg viewBox="0 0 72 72" fill="none"><circle cx="36" cy="36" r="33" stroke="rgba(255,255,255,.15)" stroke-width="6"/><path d="M36 3A33 33 0 0 1 69 36" stroke="#e50914" stroke-width="6" stroke-linecap="round"/></svg></div>' +
    '<div class="intro off"><p></p><p></p></div>' +
    '<div class="paused off"><div class="text"><p class="eyebrow">Oglądasz</p><p class="big"></p><p class="sub2"></p><p class="epl"></p><p class="desc"></p></div><p class="label">Wstrzymano</p></div>' +
    '<div class="chrome off"><div class="scrim-top"></div>' +
    '<div class="top"><div class="b ab" data-f="exit">' + icons.arrow + '</div><div class="tb ghost" data-f="site">Serwery</div></div>' +
    '<div class="bottom"><div class="scrim-bottom"></div>' +
    '<div class="progress"><div class="line"><div class="track"><i class="buf"></i><i class="played"></i></div><div class="thumb"><i></i></div><div class="scrub"><div></div><span></span></div></div><span class="time"></span></div>' +
    '<div class="row"><div class="left"><div class="b ib" data-f="play">' + icons.play + '</div><div class="b ib" data-f="rewind">' + icons.back10 + '</div><div class="b ib" data-f="forward">' + icons.fwd10 + '</div><div class="b ib" data-f="volume">' + icons.volume + '</div></div>' +
    '<div class="title"><b></b> <span></span></div>' +
    '<div class="right"><div class="pair"><div class="b ib" data-f="next">' + icons.next + '</div><div class="b ib" data-f="episodes">' + icons.episodes + '</div></div><div class="pair"><div class="b ib" data-f="tracks">' + icons.subtitles + '</div><div class="b ib" data-f="speed">' + icons.speed + '</div></div></div></div>' +
    '<div class="panel nextp"><header><span class="h">Następny odcinek</span><div><div class="tb white" data-p="go"><i></i>' + icons.triangle + '<span>Następny odcinek</span></div><div class="tb grey" data-p="cancel">Anuluj</div></div></header>' +
    '<div class="body"><div class="still">' + icons.bigPlay + '</div><div class="meta"><p class="num"><span></span><span></span></p><p class="syn"></p></div></div></div>' +
    '<div class="panel eps"><header><span class="h"></span><span></span></header><div class="view"><div class="list"></div></div></div>' +
    '<div class="panel tracks"><div class="col"><header>Audio</header><div class="view"><div class="list"></div></div></div><div class="col"><header>Napisy</header><div class="view"><div class="list"></div></div></div></div>' +
    '<div class="panel speed"><span class="h">Prędkość odtwarzania</span><div class="rail"></div></div>' +
    '<div class="panel vol"><div class="vt"><div class="vf"></div><div class="vk"></div></div></div>' +
    '</div></div>' +
    '<div class="err"><p>Nie udało się odtworzyć wideo</p><span>To źródło nie odpowiada. Wybierz inny serwer.</span><div><div class="tb white" data-e="site">Serwery</div><div class="tb grey" data-e="exit">Wróć</div></div></div>' +
    '</div>';
  var documentStyle = '@font-face{font-family:"Rive Inter";src:url("https://rivetv.assets/fonts/Inter-Variable.woff2") format("woff2");font-weight:100 900;font-display:swap}' +
    'html[data-rive-player] body *:not([data-rive-main]):not([id^="rive-"]){visibility:hidden!important;pointer-events:none!important}' +
    'html[data-rive-player] [data-rive-main]::before,html[data-rive-player] [data-rive-main]::after{visibility:hidden!important}' +
    'html[data-rive-player] video[data-rive-main]{visibility:visible!important}' +
    'html[data-rive-player] video[data-rive-main]::-webkit-media-controls{display:none!important}' +
    'html[data-rive-player] video[data-rive-main]::cue{color:transparent;background:transparent;text-shadow:none}' +
    'html[data-rive-player] .jw-controls,html[data-rive-player] .jw-display,html[data-rive-player] .jw-controlbar,html[data-rive-player] .jw-title,html[data-rive-player] .plyr__controls,html[data-rive-player] .plyr__control--overlaid,' +
    'html[data-rive-player] .vjs-control-bar,html[data-rive-player] .vjs-big-play-button,html[data-rive-player] .art-controls,html[data-rive-player] .art-bottom,html[data-rive-player] .art-mask,' +
    'html[data-rive-player] media-controls,html[data-rive-player] [data-media-controls],html[data-rive-player] .vds-controls,html[data-rive-player] .media-control,html[data-rive-player] .player-poster{opacity:0!important;pointer-events:none!important}' +
    'html[data-rive-player] .jw-captions,html[data-rive-player] .jw-captions *{visibility:visible!important}';

  function frames() {return document.querySelectorAll('iframe');}
  function childFrame(source) {
    return Array.prototype.find.call(frames(),function (frame) {return frame.contentWindow === source;});
  }
  function down(message) {
    Array.prototype.forEach.call(frames(),function (frame) {
      try { frame.contentWindow.postMessage(message,'*'); } catch (_) {}
    });
  }
  function playback() {return window.RiveTVPlayback;}
  function session() {return playback() ? playback().session() : null;}
  function clamp(value,min,max) {return Math.max(min,Math.min(max,value));}
  function text(value,limit) {return typeof value === 'string' ? value.slice(0,limit || 120) : '';}
  function image(value) {return typeof value === 'string' && value.indexOf('https://image.tmdb.org/') === 0 ? value : '';}
  function format(seconds) {
    seconds = Math.max(0,Math.floor(seconds || 0));
    var h = Math.floor(seconds / 3600), m = Math.floor(seconds % 3600 / 60), s = seconds % 60;
    return (h ? h + ':' + (m < 10 ? '0' : '') + m : (m < 10 ? '0' : '') + m) + ':' + (s < 10 ? '0' : '') + s;
  }

  function patchHls(Hls) {
    try {
      if (Hls && Hls.prototype && typeof Hls.prototype.attachMedia === 'function' && !Hls.prototype.riveAttach) {
        var attach = Hls.prototype.attachMedia;
        Hls.prototype.riveAttach = true;
        Hls.prototype.attachMedia = function (media) {
          try { if (media) media.riveHls = this; } catch (_) {}
          return attach.apply(this,arguments);
        };
      }
    } catch (_) {}
    return Hls;
  }
  try {
    var hlsValue = patchHls(window.Hls);
    Object.defineProperty(window,'Hls',{configurable:true,enumerable:true,
      get:function () {return hlsValue;},set:function (value) {hlsValue = patchHls(value);}});
  } catch (_) {}

  var id = Math.random().toString(36).slice(2), sequence = 0, seen = [];
  function fresh(seq) {
    if (typeof seq !== 'string' || seq.length > 60 || seen.indexOf(seq) !== -1) return false;
    seen.push(seq);if (seen.length > 40) seen.shift();
    return true;
  }
  var host, shadow, el = {}, video = null, marked = [], sessionId = null, view = null, viewText = '';
  var visible = false, compact = false, panel = null, zone = 'row', rowIndex = 0, topIndex = 0;
  var panelIndex = 0, panelCol = 1, nextFocus = 0, nextShown = false, nextDismissed = false, nextPreview = false;
  var pausedScreen = false, introShown = false, errorIndex = 0, scrub = null, scrubRepeat = 0;
  var hideTimer, pauseTimer, progressTimer, introTimer, bufferTimer, siteVisible = false, lastStatus = '', statusSent = 0;
  var subTrack = null, subReady = false, audioList = null, subList = null, speedIndex = 2, documentCss = null;

  function siteMode() {
    if (root) return !!(playback() && playback().isWatch() && !playback().hidden());
    return siteVisible;
  }
  function findVideo() {
    var best = null, area = 0, min = innerWidth * innerHeight * .25;
    Array.prototype.forEach.call(document.querySelectorAll('video'),function (candidate) {
      var r = candidate.getBoundingClientRect(), size = r.width * r.height;
      if (size < min || size <= area || !(candidate.readyState >= 1 || candidate.currentSrc || !candidate.paused)) return;
      best = candidate;area = size;
    });
    return best;
  }
  function mount() {
    if (host) return;
    documentCss = document.createElement('style');documentCss.id = 'rive-player-style';documentCss.textContent = documentStyle;
    (document.head || document.documentElement).appendChild(documentCss);
    host = document.createElement('div');host.id = 'rive-player';host.hidden = true;
    shadow = host.attachShadow({mode:'open'});
    shadow.innerHTML = '<style>' + css + '</style>' + markup;
    function q(selector) {return shadow.querySelector(selector);}
    ['stage','chrome','progress','time','scrub','thumb','title','intro','paused','spin','err','sub','row'].forEach(function (name) {el[name] = q('.' + name);});
    el.played = q('.played');el.buf = q('.buf');el.nextp = q('.nextp');el.eps = q('.eps');el.tracks = q('.tracks');el.speed = q('.speed');el.vol = q('.vol');
    el.cols = shadow.querySelectorAll('.col');el.rail = q('.rail');
    RATES.forEach(function (rate,index) {
      var stop = document.createElement('div');stop.className = 'stop';stop.style.left = [0,186,364,550,736][index] + 'px';
      stop.innerHTML = '<b></b><i></i><span></span>';
      stop.querySelector('span').textContent = rate === 1 ? '1x (Normalna)' : rate + 'x';
      el.rail.appendChild(stop);
    });
    window.addEventListener('resize',layout);
    layout();
  }
  function layout() {
    if (!el.stage || !innerWidth) return;
    var scale = innerWidth / 1440;
    el.stage.style.setProperty('--s',String(scale));
    el.stage.style.setProperty('--h',(innerHeight / scale) + 'px');
  }
  function attach() {
    if (host && !host.isConnected) document.documentElement.appendChild(host);
    if (documentCss && !documentCss.isConnected) (document.head || document.documentElement).appendChild(documentCss);
  }
  function mark() {
    var chain = [];
    for (var node = video; node && node !== document.body && node !== document.documentElement; node = node.parentElement) chain.push(node);
    marked.forEach(function (node) {if (chain.indexOf(node) === -1) node.removeAttribute('data-rive-main');});
    chain.forEach(function (node) {if (!node.hasAttribute('data-rive-main')) node.setAttribute('data-rive-main','');});
    marked = chain;
  }
  var events = ['play','pause','playing','waiting','seeking','seeked','ended','error','canplay','ratechange','volumechange','loadedmetadata'];
  function bind(next) {
    if (video) events.forEach(function (name) {video.removeEventListener(name,onVideo);});
    if (subTrack) subTrack.removeEventListener('cuechange',renderCues);
    video = next;subTrack = null;subReady = false;audioList = subList = null;
    if (!video) {
      marked.forEach(function (node) {node.removeAttribute('data-rive-main');});marked = [];
      document.documentElement.removeAttribute('data-rive-player');
      if (host) host.hidden = true;
      hideControls();setPausedScreen(false);
      return;
    }
    mount();attach();
    events.forEach(function (name) {video.addEventListener(name,onVideo);});
    if (video.muted) video.muted = false;
    renderPlay();renderCues();
  }
  function reset(next) {
    sessionId = next;nextShown = nextDismissed = nextPreview = introShown = false;scrub = null;subReady = false;
    if (host) {hideControls();setPausedScreen(false);}
  }
  function onVideo(event) {
    var type = event.type;
    if (type === 'play' || type === 'pause' || type === 'ended') renderPlay();
    if (type === 'pause' && !video.ended && host && !host.hidden && !visible && !pausedScreen) show(false,'row',0);
    if (type === 'play' && pausedScreen) setPausedScreen(false);
    if (type === 'play' || type === 'pause') arm();
    if (type === 'playing') intro();
    if (type === 'ended' && !visible) show(false,'row',0);
    if (type === 'ratechange') speedIndex = Math.max(0,RATES.indexOf(video.playbackRate));
    if (type === 'volumechange') {renderVolume();renderPlay();}
    buffering();renderError();
  }
  function renderPlay() {
    if (!host || !video) return;
    var play = shadow.querySelector('[data-f="play"]'), state = video.paused ? 'play' : 'pause';
    if (play.getAttribute('data-icon') !== state) {play.setAttribute('data-icon',state);play.innerHTML = icons[state];}
    var volume = shadow.querySelector('[data-f="volume"]'), level = video.muted || video.volume === 0 ? 'mute' : 'volume';
    if (volume.getAttribute('data-icon') !== level) {volume.setAttribute('data-icon',level);volume.innerHTML = icons[level];}
  }
  function buffering() {
    if (!host) return;
    clearTimeout(bufferTimer);
    var waiting = video && !video.paused && !video.ended && !video.error && (video.seeking || video.readyState < 3);
    if (!waiting) {el.spin.classList.remove('on2');return;}
    bufferTimer = setTimeout(function () {if (video && !video.paused && (video.seeking || video.readyState < 3)) el.spin.classList.add('on2');},400);
  }
  function errorShown() {return !!(video && video.error);}
  function renderError() {
    if (!host) return;
    var shown = errorShown();
    el.err.classList.toggle('on2',shown);
    if (shown) {el.spin.classList.remove('on2');renderFocus();}
  }
  function intro() {
    if (introShown || visible || !view || !view.title || !host) return;
    introShown = true;
    var lines = el.intro.querySelectorAll('p');
    lines[0].textContent = view.type === 'tv' ? view.title : '';
    lines[1].textContent = view.type === 'tv' ? 'Odc. ' + view.episode + (view.episodeTitle ? ' „' + view.episodeTitle + '”' : '') : view.title;
    el.intro.className = 'intro on';
    clearTimeout(introTimer);introTimer = setTimeout(function () {el.intro.className = 'intro off';},4500);
  }
  function setPausedScreen(on) {
    pausedScreen = on;
    if (!host) return;
    if (on && view) {
      el.paused.querySelector('.big').textContent = view.title || '';
      el.paused.querySelector('.sub2').textContent = view.type === 'tv' ? 'Sezon ' + view.season : (view.tagline || '');
      el.paused.querySelector('.epl').textContent = view.type === 'tv' ? 'Odcinek ' + view.episode + (view.episodeTitle ? ': ' + view.episodeTitle : '') : '';
      el.paused.querySelector('.desc').textContent = view.synopsis || '';
    }
    el.paused.className = 'paused ' + (on ? 'on' : 'off');
    report();
  }
  function rowButtons() {
    var names = ['play','rewind','forward','volume'];
    if (view && view.hasNext) names.push('next');
    if (view && view.episodes && view.episodes.length) names.push('episodes');
    names.push('tracks','speed');
    return names;
  }
  function topButtons() {return ['exit','site'];}
  function show(isCompact,nextZone,index) {
    if (!host) return;
    visible = true;compact = !!isCompact;
    if (nextZone) zone = nextZone;
    if (typeof index === 'number') {if (zone === 'row') rowIndex = index;else if (zone === 'top') topIndex = index;}
    if (pausedScreen) setPausedScreen(false);
    el.intro.className = 'intro off';
    renderChrome();renderProgress();
    clearInterval(progressTimer);progressTimer = setInterval(renderProgress,500);
    arm();report();
  }
  function hideControls() {
    if (scrub) commit();
    visible = false;compact = false;nextPreview = false;
    if (panel) panel = null;
    clearInterval(progressTimer);clearTimeout(hideTimer);
    if (host) renderChrome();
    report();
  }
  function renderChrome() {
    var names = rowButtons();
    Array.prototype.forEach.call(shadow.querySelectorAll('.row [data-f]'),function (button) {button.style.display = names.indexOf(button.getAttribute('data-f')) === -1 ? 'none' : '';});
    rowIndex = clamp(rowIndex,0,names.length - 1);
    el.chrome.className = 'chrome ' + (visible ? 'on' : 'off') + (compact ? ' compact' : '') + (panel ? ' paneled' : '');
    el.sub.classList.toggle('up',visible && !compact);
    el.title.querySelector('b').textContent = view ? view.title || '' : '';
    el.title.querySelector('span').textContent = view && view.type === 'tv' ? 'Odc. ' + view.episode + (view.episodeTitle ? '  ' + view.episodeTitle : '') : '';
    [['next',el.nextp],['episodes',el.eps],['tracks',el.tracks],['speed',el.speed],['volume',el.vol]].forEach(function (pair) {pair[1].classList.toggle('open',visible && panel === pair[0]);});
    if (panel === 'next') renderNext();
    if (panel === 'episodes') renderEpisodes();
    if (panel === 'tracks') renderTracks();
    if (panel === 'speed') renderSpeed();
    if (panel === 'volume') renderVolume();
    renderFocus();
  }
  function renderFocus() {
    if (!host) return;
    Array.prototype.forEach.call(shadow.querySelectorAll('.f:not(.it):not(.ep):not(.stop)'),function (node) {node.classList.remove('f');});
    if (errorShown()) {shadow.querySelectorAll('[data-e]')[errorIndex].classList.add('f');return;}
    if (!visible) return;
    if (zone === 'progress') el.progress.classList.add('f');
    else if (zone === 'top') shadow.querySelector('[data-f="' + topButtons()[topIndex] + '"]').classList.add('f');
    else if (zone === 'row' || panel === 'volume' || panel === 'speed') {
      var button = shadow.querySelector('.row [data-f="' + rowButtons()[rowIndex] + '"]');
      if (button && zone === 'row') button.classList.add('f');
    }
    if (zone === 'panel' || panel === 'volume') {
      var trigger = shadow.querySelector('.row [data-f="' + (panel === 'next' ? 'next' : panel) + '"]');
      if (trigger && panel !== 'next') trigger.classList.add('f');
    }
    if (zone === 'panel' && panel === 'next') {
      var buttons = Array.prototype.filter.call(el.nextp.querySelectorAll('[data-p]'),function (node) {return node.style.display !== 'none';});
      if (buttons.length) buttons[clamp(nextFocus,0,buttons.length - 1)].classList.add('f');
    }
  }
  function renderProgress() {
    if (!host || !video) return;
    var duration = video.duration;
    var known = Number.isFinite(duration) && duration > 0;
    el.progress.style.visibility = known ? '' : 'hidden';
    if (!known) return;
    var time = scrub ? scrub.target : video.currentTime, fraction = clamp(time / duration,0,1), buffered = 0;
    try {
      for (var i = 0; i < video.buffered.length; i++) if (video.buffered.start(i) <= video.currentTime + 1) buffered = Math.max(buffered,video.buffered.end(i));
    } catch (_) {}
    el.played.style.transform = 'scaleX(' + fraction + ')';
    el.buf.style.transform = 'scaleX(' + clamp(buffered / duration,0,1) + ')';
    el.thumb.style.transform = 'translateX(' + (TRACK * fraction) + 'px)';
    el.time.textContent = format(duration - time);
    el.scrub.classList.toggle('on2',!!scrub);
    if (scrub) {
      el.scrub.style.transform = 'translateX(' + clamp(TRACK * fraction,122,TRACK - 122) + 'px)';
      el.scrub.querySelector('span').textContent = format(time);
      var still = view && (view.still || view.backdrop);
      var box = el.scrub.querySelector('div');
      if (box.getAttribute('data-image') !== still) {box.setAttribute('data-image',still || '');box.style.backgroundImage = still ? 'url("' + still + '")' : '';}
    }
  }
  function arm() {
    clearTimeout(hideTimer);clearTimeout(pauseTimer);
    if (!video || !host) return;
    if (video.paused && !video.ended) {
      pauseTimer = setTimeout(function () {
        if (video && video.paused && !video.ended && !panel && !errorShown() && !scrub) {hideControls();setPausedScreen(true);}
      },5000);
      return;
    }
    if (visible && !panel && !scrub) hideTimer = setTimeout(hideControls,3000);
  }
  function command(action) {
    if (playback()) playback().command(action);
    renderPlay();
  }
  function scrubBy(direction,repeat) {
    if (!video || !Number.isFinite(video.duration)) return;
    scrubRepeat = repeat ? scrubRepeat + 1 : 0;
    var step = scrubRepeat < 6 ? 10 : scrubRepeat < 14 ? 30 : 60;
    var base = scrub ? scrub.target : video.currentTime;
    if (!scrub) scrub = {};
    scrub.target = clamp(base + direction * step,0,video.duration);
    clearTimeout(scrub.timer);scrub.timer = setTimeout(commit,1000);
    renderProgress();arm();
  }
  function commit() {
    if (!scrub) return;
    clearTimeout(scrub.timer);
    var target = scrub.target;scrub = null;
    try { if (video && Number.isFinite(target)) video.currentTime = target; } catch (_) {}
    renderProgress();arm();
  }
  function act(action,data) {
    var message = {riveTV:'action',id:id,action:action,seq:id + ':' + (++sequence)};
    if (data) Object.keys(data).forEach(function (key) {message[key] = data[key];});
    if (root) perform(message);
    else window.parent.postMessage(message,'*');
  }
  function openPanel(name,inside) {
    panel = name;zone = inside ? 'panel' : 'row';panelIndex = 0;nextPreview = false;
    if (name === 'tracks') {audioList = audioSource();subList = subtitleSource();panelCol = subList.items.length > 1 || audioList.items.length < 2 ? 1 : 0;panelIndex = Math.max(0,(panelCol ? subList : audioList).current);}
    if (name === 'speed') panelIndex = speedIndex = Math.max(0,RATES.indexOf(video.playbackRate));
    if (name === 'episodes' && view) panelIndex = Math.max(0,view.episodes.findIndex(function (item) {return String(item.episode) === String(view.episode);}));
    renderChrome();arm();report();
  }
  function closePanel() {
    var name = panel;
    panel = null;nextPreview = false;zone = 'row';
    var index = rowButtons().indexOf(name);
    if (index !== -1) rowIndex = index;
    renderChrome();arm();report();
  }
  function activateRow(name) {
    if (name === 'play') command('toggle');
    else if (name === 'rewind' || name === 'forward') command(name);
    else if (name === 'next') act('next');
    else if (name === 'volume' || name === 'episodes' || name === 'tracks' || name === 'speed') {
      if (panel === name) closePanel();else openPanel(name,name !== 'volume');
    }
  }
  function moveRow(delta) {
    var names = rowButtons();
    rowIndex = clamp(rowIndex + delta,0,names.length - 1);
    if (panel === 'volume') panel = null;
    if (names[rowIndex] === 'next' && !panel && view && view.next) {panel = 'next';nextPreview = true;}
    else if (nextPreview && names[rowIndex] !== 'next') {panel = null;nextPreview = false;}
    renderChrome();
  }
  function handleKey(key,repeat) {
    if (!video || !host || host.hidden) return false;
    if (key === 'toggle' || key === 'play' || key === 'pause') {command(key);if (visible) renderFocus();else if (video.paused) show(false,'row',0);return true;}
    if (key === 'forward' || key === 'rewind') {command(key);if (!visible) show(true,'progress');else renderProgress();arm();return true;}
    if (errorShown()) {
      if (key === 'left' || key === 'right') errorIndex = key === 'left' ? 0 : 1;
      else if (key === 'ok') act(errorIndex ? 'exit' : 'site');
      renderFocus();return true;
    }
    if (pausedScreen) {
      setPausedScreen(false);
      if (key === 'ok') command('toggle');
      else show(false,'row',0);
      return true;
    }
    if (!visible) {
      if (key === 'ok') {command('toggle');if (video.paused) show(false,'row',0);}
      else if (key === 'left' || key === 'right') {show(true,'progress');scrubBy(key === 'right' ? 1 : -1,repeat);}
      else if (key === 'up') show(false,'progress');
      else if (panel === 'next' || nextShown && view && view.next && view.next.eligible && !nextDismissed) {show(false,'panel');panel = 'next';renderChrome();}
      else show(false,'row',0);
      return true;
    }
    if (compact && key !== 'left' && key !== 'right' && !(key === 'ok' && scrub)) {
      compact = false;
      if (key === 'back' || key === 'down') zone = 'row';
      renderChrome();arm();report();
      if (key === 'back' || key === 'down' || key === 'up') return true;
    }
    arm();
    if (zone === 'panel' || panel === 'volume') return panelKey(key);
    if (key === 'back') {
      if (panel === 'next' && !nextPreview) {nextDismissed = true;if (view && view.next && view.next.auto) act('cancelNext');}
      if (panel) closePanel();else hideControls();
      return true;
    }
    if (zone === 'top') {
      if (key === 'left' || key === 'right') topIndex = clamp(topIndex + (key === 'right' ? 1 : -1),0,1);
      else if (key === 'down') zone = 'progress';
      else if (key === 'ok') act(topButtons()[topIndex]);
    } else if (zone === 'progress') {
      if (key === 'left' || key === 'right') {scrubBy(key === 'right' ? 1 : -1,repeat);return true;}
      if (key === 'ok') {if (scrub) commit();else command('toggle');}
      else if (key === 'up') {if (scrub) commit();zone = 'top';}
      else if (key === 'down') {if (scrub) commit();zone = 'row';}
    } else {
      if (key === 'left' || key === 'right') {moveRow(key === 'right' ? 1 : -1);arm();report();return true;}
      if (key === 'up') {
        if (panel === 'next' && view && view.next) {zone = 'panel';nextFocus = 0;}
        else {if (panel) {panel = null;nextPreview = false;}zone = 'progress';}
      } else if (key === 'ok') activateRow(rowButtons()[rowIndex]);
    }
    renderChrome();report();
    return true;
  }
  function panelKey(key) {
    if (panel === 'volume') {
      if (key === 'up' || key === 'down') {video.muted = false;video.volume = clamp(Math.round((video.volume + (key === 'up' ? .1 : -.1)) * 10) / 10,0,1);renderVolume();}
      else if (key === 'ok') video.muted = !video.muted;
      else if (key === 'back') closePanel();
      else if (key === 'left' || key === 'right') {panel = null;moveRow(key === 'right' ? 1 : -1);report();}
      return true;
    }
    if (key === 'back') {
      if (panel === 'next') {nextDismissed = true;if (view && view.next && view.next.auto) act('cancelNext');}
      closePanel();return true;
    }
    if (panel === 'next') {
      var buttons = Array.prototype.filter.call(el.nextp.querySelectorAll('[data-p]'),function (node) {return node.style.display !== 'none';});
      if (key === 'left' || key === 'right') nextFocus = clamp(nextFocus + (key === 'right' ? 1 : -1),0,buttons.length - 1);
      else if (key === 'down') {zone = 'row';var index = rowButtons().indexOf('next');rowIndex = index === -1 ? 0 : index;}
      else if (key === 'ok') {
        var chosen = buttons[clamp(nextFocus,0,buttons.length - 1)];
        if (chosen && chosen.getAttribute('data-p') === 'cancel') {act('cancelNext');nextFocus = 0;}
        else act('next');
      }
      renderChrome();return true;
    }
    if (panel === 'episodes') {
      var list = view && view.episodes || [];
      if (key === 'up' || key === 'down') panelIndex = clamp(panelIndex + (key === 'down' ? 1 : -1),0,list.length - 1);
      else if (key === 'left') {closePanel();return true;}
      else if (key === 'ok' && list[panelIndex]) {
        if (String(list[panelIndex].episode) === String(view.episode)) closePanel();
        else act('episode',{season:list[panelIndex].season,episode:list[panelIndex].episode});
        return true;
      }
      renderEpisodes();renderFocus();return true;
    }
    if (panel === 'tracks') {
      var source = panelCol ? subList : audioList;
      if (key === 'up' || key === 'down') panelIndex = clamp(panelIndex + (key === 'down' ? 1 : -1),0,source.items.length - 1);
      else if (key === 'left' || key === 'right') {
        var col = key === 'right' ? 1 : 0;
        if (col !== panelCol) {panelCol = col;source = panelCol ? subList : audioList;panelIndex = clamp(source.current,0,source.items.length - 1);}
      } else if (key === 'ok') {
        source.select(panelIndex);
        if (panelCol) act('subtitles',{value:panelIndex ? subList.items[panelIndex].toLowerCase() : 'off'});
        audioList = audioSource();subList = subtitleSource();
      }
      renderTracks();return true;
    }
    if (panel === 'speed') {
      if (key === 'left' || key === 'right') panelIndex = clamp(panelIndex + (key === 'right' ? 1 : -1),0,RATES.length - 1);
      else if (key === 'ok') {video.playbackRate = RATES[panelIndex];speedIndex = panelIndex;}
      else if (key === 'down' || key === 'up') {closePanel();return true;}
      renderSpeed();return true;
    }
    return true;
  }
  function renderNext() {
    var next = view && view.next || {};
    var go = el.nextp.querySelector('[data-p="go"]'), cancel = el.nextp.querySelector('[data-p="cancel"]');
    var auto = !nextPreview && next.eligible && next.auto && typeof next.remaining === 'number';
    var label = auto ? 'Następny odcinek za ' + next.remaining + ' s' : 'Następny odcinek';
    if (go.querySelector('span').textContent !== label) go.querySelector('span').textContent = label;
    go.className = 'tb ' + (auto ? 'count' : 'white');
    go.querySelector('i').style.transform = 'scaleX(' + (auto ? clamp((15 - next.remaining) / 15,0,1) : 0) + ')';
    cancel.style.display = auto ? '' : 'none';
    if (!auto) nextFocus = 0;
    var num = el.nextp.querySelectorAll('.num span');
    num[0].textContent = next.episode ? String(next.episode) : '';
    num[1].textContent = next.title || (next.episode ? 'Odcinek ' + next.episode : '');
    el.nextp.querySelector('.syn').textContent = next.synopsis || (next.season && view && String(next.season) !== String(view.season) ? 'Sezon ' + next.season : '');
    var still = el.nextp.querySelector('.still');
    if (still.getAttribute('data-image') !== (next.still || '')) {still.setAttribute('data-image',next.still || '');still.style.backgroundImage = next.still ? 'url("' + next.still + '")' : '';}
  }
  function renderEpisodes() {
    var list = view && view.episodes || [], box = el.eps.querySelector('.list');
    var heads = el.eps.querySelectorAll('header span');
    heads[0].textContent = view ? view.title || '' : '';heads[1].textContent = view ? 'Sezon ' + view.season : '';
    var signature = list.map(function (item) {return item.episode + ':' + item.title + ':' + item.progress;}).join('|');
    if (box.getAttribute('data-signature') !== signature) {
      box.setAttribute('data-signature',signature);box.textContent = '';
      list.forEach(function (item) {
        var row = document.createElement('div');row.className = 'ep' + (String(item.episode) === String(view.episode) ? ' cur' : '');
        row.innerHTML = '<div class="r1"><span></span><span></span><span class="bar"><i></i></span></div><div class="r2"><div class="still">' + icons.bigPlay + '</div><p class="syn"></p></div>';
        var spans = row.querySelectorAll('.r1 span');spans[0].textContent = String(item.episode);spans[1].textContent = item.title || 'Odcinek ' + item.episode;
        row.querySelector('.bar i').style.transform = 'scaleX(' + clamp(item.progress || 0,0,1) + ')';
        row.querySelector('.syn').textContent = item.synopsis || '';
        row.setAttribute('data-image',item.still || '');
        box.appendChild(row);
      });
    }
    Array.prototype.forEach.call(box.children,function (row,index) {
      var focused = zone === 'panel' && index === panelIndex;
      row.classList.toggle('f',focused);row.classList.toggle('big',index === panelIndex);
      if (index === panelIndex) {
        var still = row.querySelector('.still');
        if (!still.style.backgroundImage && row.getAttribute('data-image')) still.style.backgroundImage = 'url("' + row.getAttribute('data-image') + '")';
      }
    });
    scrollList(box,box.children[panelIndex],475);
  }
  function scrollList(box,item,height) {
    if (!item) {box.style.transform = '';return;}
    var offset = Number(box.getAttribute('data-offset')) || 0, top = item.offsetTop, bottom = top + item.offsetHeight;
    if (bottom - offset > height) offset = bottom - height;
    if (top < offset) offset = top;
    box.setAttribute('data-offset',String(offset));
    box.style.transform = 'translateY(' + (-offset) + 'px)';
  }
  function renderTracks() {
    if (!audioList) audioList = audioSource();
    if (!subList) subList = subtitleSource();
    [audioList,subList].forEach(function (source,col) {
      var box = el.cols[col].querySelector('.list');box.textContent = '';
      source.items.forEach(function (label,index) {
        var item = document.createElement('div');item.className = 'it' + (index === source.current ? ' sel' : '') + (zone === 'panel' && col === panelCol && index === panelIndex ? ' f' : '');
        item.innerHTML = icons.check;item.appendChild(document.createTextNode(label));
        box.appendChild(item);
      });
      scrollList(box,col === panelCol ? box.children[panelIndex] : null,496);
    });
  }
  function renderSpeed() {
    Array.prototype.forEach.call(el.rail.children,function (stop,index) {
      stop.classList.toggle('f',index === panelIndex);stop.classList.toggle('sel',index === speedIndex);
    });
  }
  function renderVolume() {
    if (!host || !video) return;
    var level = video.muted ? 0 : clamp(video.volume,0,1);
    el.vol.querySelector('.vf').style.transform = 'scaleY(' + level + ')';
    el.vol.querySelector('.vk').style.transform = 'translateY(' + (-98 * level) + 'px)';
  }
  function label(name,language,index) {return text(name,60) || text(language,20) || 'Ścieżka ' + (index + 1);}
  function jw() {
    try {
      var player = typeof window.jwplayer === 'function' && window.jwplayer();
      return player && typeof player.getAudioTracks === 'function' && player.getContainer && player.getContainer().contains(video) ? player : null;
    } catch (_) { return null; }
  }
  function videojsPlayer() {
    try {
      var players = window.videojs && typeof window.videojs.getPlayers === 'function' ? window.videojs.getPlayers() : {};
      for (var key in players) if (players[key] && players[key].el && players[key].el().contains(video)) return players[key];
    } catch (_) {}
    return null;
  }
  function hlsPlayer() {
    var hls = video.riveHls || (window.hls && window.hls.media === video ? window.hls : null);
    return hls && Array.isArray(hls.audioTracks) ? hls : null;
  }
  function audioSource() {
    var empty = {items:['Oryginalne'],current:0,select:function () {}};
    if (!video) return empty;
    try {
      var native = video.audioTracks;
      if (native && native.length > 1) {
        var items = [], current = 0;
        for (var i = 0; i < native.length; i++) {items.push(label(native[i].label,native[i].language,i));if (native[i].enabled) current = i;}
        return {items:items,current:current,select:function (index) {for (var j = 0; j < native.length; j++) native[j].enabled = j === index;}};
      }
      var hls = hlsPlayer();
      if (hls && hls.audioTracks.length > 1) return {items:hls.audioTracks.map(function (track,index) {return label(track.name,track.lang,index);}),current:hls.audioTrack,select:function (index) {hls.audioTrack = index;}};
      var player = jw();
      if (player && (player.getAudioTracks() || []).length > 1) return {items:player.getAudioTracks().map(function (track,index) {return label(track.name || track.label,track.language,index);}),current:player.getCurrentAudioTrack(),select:function (index) {player.setCurrentAudioTrack(index);}};
      var vjs = videojsPlayer(), tracks = vjs && vjs.audioTracks && vjs.audioTracks();
      if (tracks && tracks.length > 1) {
        var list = [], selected = 0;
        for (var k = 0; k < tracks.length; k++) {list.push(label(tracks[k].label,tracks[k].language,k));if (tracks[k].enabled) selected = k;}
        return {items:list,current:selected,select:function (index) {for (var m = 0; m < tracks.length; m++) tracks[m].enabled = m === index;}};
      }
    } catch (_) {}
    return empty;
  }
  function textTracks() {
    var list = video && video.textTracks;
    return list ? Array.prototype.filter.call(list,function (track) {return track.kind === 'subtitles' || track.kind === 'captions';}) : [];
  }
  function jwCaptions() {
    var player = jw();
    try { return player && typeof player.getCaptionsList === 'function' && (player.getCaptionsList() || []).length > 1 ? player : null; } catch (_) { return null; }
  }
  function subtitleSource() {
    var player = jwCaptions();
    if (player) {
      var captions = player.getCaptionsList();
      return {items:['Wyłączone'].concat(captions.slice(1).map(function (track,index) {return label(track.label,track.language,index);})),
        current:player.getCurrentCaptions() || 0,select:function (index) {player.setCurrentCaptions(index);}};
    }
    var tracks = textTracks();
    return {items:['Wyłączone'].concat(tracks.map(function (track,index) {return label(track.label,track.language,index);})),
      current:subTrack ? tracks.indexOf(subTrack) + 1 : 0,select:function (index) {chooseText(index ? tracks[index - 1] : null);}};
  }
  function chooseText(track) {
    textTracks().forEach(function (item) {if (item !== track && item.mode !== 'disabled') item.mode = 'disabled';});
    if (subTrack && subTrack !== track) subTrack.removeEventListener('cuechange',renderCues);
    if (track && track.mode !== 'hidden') track.mode = 'hidden';
    if (track && subTrack !== track) track.addEventListener('cuechange',renderCues);
    subTrack = track || null;renderCues();
  }
  function renderCues() {
    if (!host) return;
    var lines = [];
    try {
      var cues = subTrack && subTrack.activeCues;
      if (cues) for (var i = 0; i < cues.length; i++) if (typeof cues[i].text === 'string') lines.push(cues[i].text);
    } catch (_) {}
    var value = lines.join('\n').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').trim();
    var span = el.sub.querySelector('span');
    if (span.textContent !== value) span.textContent = value;
  }
  function syncSubtitles() {
    if (jwCaptions()) return;
    var tracks = textTracks();
    if (!subReady && tracks.length && view) {
      subReady = true;
      var preference = view.subtitles, chosen = null;
      if (preference && preference !== 'off') chosen = tracks.find(function (track,index) {return label(track.label,track.language,index).toLowerCase() === preference;}) || null;
      if (!preference) chosen = tracks.find(function (track) {return track.mode === 'showing';}) || null;
      chooseText(chosen);
    } else if (subTrack && subTrack.mode !== 'hidden') subTrack.mode = 'hidden';
  }
  function updateNext() {
    var next = view && view.next;
    if (next && next.eligible && !nextShown && !nextDismissed) {
      nextShown = true;
      if (!errorShown()) {panel = 'next';nextPreview = false;nextFocus = 0;show(false,'panel');}
    } else if (!(next && next.eligible) && nextShown) {
      nextShown = false;
      if (panel === 'next' && !nextPreview) closePanel();
    }
    if (visible && panel === 'next') renderNext();
  }
  function applyView(next) {
    view = next;
    if (!host) return;
    updateNext();
    if (visible) renderChrome();
  }
  function status() {
    return {riveTV:'overlay',id:id,active:!!(video && sessionId && host),visible:visible && !compact || errorShown(),panel:visible ? panel : null,ready:!!view};
  }
  function report(force) {
    if (root) return;
    var current = status(), serialized = JSON.stringify(current);
    if (!force && serialized === lastStatus && Date.now() - statusSent < 1000) return;
    lastStatus = serialized;statusSent = Date.now();
    window.parent.postMessage(current,'*');
  }
  function tick() {
    if (!document.documentElement) return;
    var current = session();
    if (current !== sessionId) reset(current);
    var next = current && document.body ? findVideo() : null;
    if (next !== video) bind(next);
    if (video) {
      attach();
      if (video.controls) video.controls = false;
      mark();
      var site = siteMode();
      if (site && visible) hideControls();
      if (site && pausedScreen) setPausedScreen(false);
      if (site) document.documentElement.removeAttribute('data-rive-player');
      else if (!document.documentElement.hasAttribute('data-rive-player')) document.documentElement.setAttribute('data-rive-player','');
      host.hidden = site;
      syncSubtitles();buffering();renderError();
      if (!visible && !introShown && !video.paused && video.currentTime < 30) intro();
    }
    if (root) rootTick();
    report(true);
  }

  var remote = null, rootView = null, viewSent = 0, siteData = {route:'',checked:0,details:null,episodes:null};
  function readSite(info) {
    var route = location.pathname + location.search;
    if (siteData.route !== route) siteData = {route:route,checked:0,details:null,episodes:null};
    if (siteData.details && (siteData.episodes || info.type !== 'tv') || Date.now() - siteData.checked < 2000) return siteData;
    siteData.checked = Date.now();
    var start = document.querySelector('[aria-label="Toggle Quick Menu"]') || document.querySelector('[class*="Watch_watch__"]');
    var key = start && Object.keys(start).find(function (name) {return name.indexOf('__reactFiber$') === 0;});
    var fiber = key && start[key], top = fiber;
    if (!fiber) return siteData;
    while (top.return) top = top.return;
    if (top.stateNode && top.stateNode.current !== top && fiber.alternate) fiber = fiber.alternate;
    for (var depth = 0; fiber && depth < 80; fiber = fiber.return, depth++) {
      var hook = fiber.memoizedState;
      for (var count = 0; hook && typeof hook === 'object' && count < 150; hook = hook.next, count++) {
        var value = hook.memoizedState;
        if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
        if (!siteData.episodes && info.type === 'tv' && Array.isArray(value.episodes) && value.episodes[0] && typeof value.episodes[0].episode_number === 'number' &&
            (value.episodes[0].season_number === undefined || String(value.episodes[0].season_number) === info.season)) siteData.episodes = value.episodes;
        else if (!siteData.details && typeof value.overview === 'string' && (typeof value.name === 'string' || typeof value.title === 'string') && String(value.id) === info.id) siteData.details = value;
      }
      if (siteData.details && (siteData.episodes || info.type !== 'tv')) break;
    }
    return siteData;
  }
  function progressOf(info,episode) {
    try {
      var saved = JSON.parse(localStorage.getItem('RiveTVProgress') || '{}')['tv:' + info.id + ':' + info.season + ':' + episode];
      return saved ? saved.complete ? 1 : saved.time / saved.duration : 0;
    } catch (_) { return 0; }
  }
  function buildView() {
    var info = playback() && playback().info();
    if (!info) return null;
    var data = readSite(info), details = data.details || {};
    var match = /^Rive \| Watch \| (.+?)(?: \| S\d+-E\d+)?$/.exec(document.title || '');
    var title = text(details.name || details.title || (match ? match[1] : ''),120);
    var still = function (path,size) {return typeof path === 'string' && path.charAt(0) === '/' ? 'https://image.tmdb.org/t/p/' + (size || 'w300') + path : '';};
    var episodes = (data.episodes || []).slice(0,200).map(function (item) {
      return {season:info.season,episode:item.episode_number,title:text(item.name,120),synopsis:text(item.overview,400),still:still(item.still_path),progress:progressOf(info,item.episode_number)};
    });
    var current = episodes.find(function (item) {return String(item.episode) === info.episode;});
    var index = current ? episodes.indexOf(current) : -1, upcoming = index !== -1 ? episodes[index + 1] : null;
    var next = {eligible:!!info.next.eligible,auto:!!info.next.auto,remaining:info.next.remaining};
    if (upcoming) {next.season = upcoming.season;next.episode = upcoming.episode;next.title = upcoming.title;next.synopsis = upcoming.synopsis;next.still = upcoming.still;}
    else if (info.type === 'tv') {next.season = String(Number(info.season) + 1);next.episode = 1;}
    return {session:playback().session(),type:info.type,id:info.id,title:title,season:info.season,episode:info.episode,
      episodeTitle:current ? current.title : '',synopsis:current && current.synopsis || text(details.overview,400),
      tagline:text(details.tagline,120),still:current ? current.still : '',backdrop:still(details.backdrop_path),
      hasNext:info.hasNext,next:info.hasNext ? next : null,episodes:episodes,subtitles:info.subtitles};
  }
  function rootTick() {
    var next = buildView();
    var serialized = JSON.stringify(next);
    if (serialized !== viewText || Date.now() - viewSent > 5000) {
      viewText = serialized;viewSent = Date.now();rootView = next;
      if (next) down({riveTV:'view',view:next});
    }
    if (rootView !== view) applyView(rootView);
  }
  function current() {
    if (video && sessionId && host) {var local = status();local.local = true;return local;}
    if (remote && remote.active && Date.now() - remote.received < 3500 && remote.session === session()) return remote;
    return null;
  }
  function perform(message) {
    var info = playback() && playback().info();
    if (!info) return;
    if (message.action === 'next') playback().next();
    else if (message.action === 'cancelNext') playback().cancelNext();
    else if (message.action === 'subtitles') playback().subtitles(typeof message.value === 'string' ? message.value.slice(0,80) : null);
    else if (message.action === 'site') {if (window.RiveTV && window.RiveTV.siteControls) window.RiveTV.siteControls(true);else playback().reveal();}
    else if (message.action === 'exit') {playback().flush();if (history.length > 1) history.back();else location.assign('/');}
    else if (message.action === 'episode' && info.type === 'tv' && rootView) {
      var target = rootView.episodes.find(function (item) {return String(item.episode) === String(message.episode) && String(item.season) === String(message.season);});
      if (!target) return;
      var url = '/watch?type=tv&id=' + encodeURIComponent(info.id) + '&season=' + encodeURIComponent(target.season) + '&episode=' + encodeURIComponent(target.episode);
      playback().flush();
      if (window.next && window.next.router && typeof window.next.router.push === 'function') window.next.router.push(url);
      else location.assign(url);
    }
  }
  window.addEventListener('message',function (event) {
    var msg = event.data;
    if (!msg || typeof msg !== 'object' || typeof msg.riveTV !== 'string') return;
    if (!root && event.source === window.parent) {
      if (msg.riveTV === 'view' && msg.view && typeof msg.view === 'object') {
        down(msg);
        var incoming = JSON.stringify(msg.view);
        if (incoming !== viewText) {viewText = incoming;applyView(msg.view);}
      } else if (msg.riveTV === 'key') {
        if (!fresh(msg.seq)) return;
        if (msg.owner === id) handleKey(String(msg.key),msg.repeat === true);
        else down(msg);
      } else if (msg.riveTV === 'controls') siteVisible = msg.visible === true;
      return;
    }
    if (msg.riveTV !== 'overlay' && msg.riveTV !== 'action') return;
    var frame = childFrame(event.source);
    if (!frame || typeof msg.id !== 'string' || msg.id.length > 40) return;
    if (msg.riveTV === 'action' && !fresh(msg.seq)) return;
    if (!root) {window.parent.postMessage(msg,'*');return;}
    if (msg.riveTV === 'overlay') {
      if (msg.active !== true && !(remote && remote.id === msg.id)) return;
      if (msg.ready !== true && rootView) down({riveTV:'view',view:rootView});
      remote = {id:msg.id,active:msg.active === true,visible:msg.visible === true,panel:typeof msg.panel === 'string' ? msg.panel : null,frame:frame,received:Date.now(),session:session()};
    } else if (remote && remote.frame === frame && remote.id === msg.id) perform(msg);
  });
  window.RiveTVPlayer = {
    active:function () {return root && !!(playback() && playback().isWatch() && current());},
    owns:function () {return this.active() && playback().hidden();},
    status:function () {var value = current();return value ? {id:value.id,local:!!value.local,visible:value.visible,panel:value.panel} : null;},
    key:function (key,repeat) {
      var target = current();
      if (!target) return false;
      if (target.local) handleKey(key,repeat === true);
      else down({riveTV:'key',owner:target.id,key:key,repeat:repeat === true,seq:id + ':' + (++sequence)});
      return true;
    },
    back:function () {
      if (!this.active()) return false;
      if (playback().conceal()) return true;
      var target = current();
      if (target.visible && !target.panel) return false;
      return this.key('back');
    }
  };
  tick();setInterval(tick,1000);
})();
