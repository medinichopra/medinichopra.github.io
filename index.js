const c1 = document.getElementById("page1");
const c2 = document.getElementById("page2");
const c3 = document.getElementById("page3");
document.addEventListener("DOMContentLoaded", (event) => {
  console.log("Page is fully loaded");
});

document.getElementById("link1").addEventListener("click", function () {
  c2.classList.remove("hidden");
  c2.innerHTML = `    <div id="page2" class="c2 min-h-screen w-full z-0 overflow-y-hidden">
  <section
    class="relative bg-gray-100 w-full h-fit overflow-hidden flex flex-col items-center justify-start pt-1 px-0 gap-0 box-border"
    data-aos="fade-in"
    data-aos-delay="50"
    data-aos-duration="1000"
    data-aos-easing="ease-in-out"
    data-aos-mirror="true"
    data-aos-once="false"
  >
    <main
      class="flex flex-col scale-90 items-center justify-center gap-9 text-left text-4xl text-gray-400 font-inter"
      id="data"
    >
      <div
        class="shrink-0 flex flex-row items-center justify-center max-h-fit lg:gap-11 xl:gap-10"
      >
        <div
          class="rounded-[20.03px] [background:linear-gradient(180.08deg,_#62cbab,_#effffa)] overflow-hidden flex flex-col items-center justify-start py-[50px] px-[33px] gap-[21px] border-[1px] border-solid border-lightgray"
        >
          <div
            class="shrink-0 flex flex-col items-start justify-start gap-[11px]"
          >
            <b class="relative tracking-[0.3px] leading-[27.4px]"
              >Ticketing</b
            >
            <div
              class="relative text-base tracking-[0.5px] leading-[26.44px] font-dm-sans"
            >
              <p class="m-0">
                Easily collaborate with colleagues to quickly solve complex
                problems,
              </p>
              <p class="m-0">
                as well as allow customers to track progress in real time.
              </p>
            </div>
          </div>
          <div class="relative w-[527px] h-[174px]">
            <img
              class="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] rounded-3xs max-w-full overflow-hidden max-h-full object-cover"
              alt=""
              src="/public/image6@2x.png"
            />
          </div>
          <div
            class="relative text-base tracking-[0.5px] leading-[26.44px] font-dm-sans"
          >
            <p class="m-0">
              Easily collaborate with colleagues to quickly solve complex
              problems,
            </p>
            <p class="m-0">
              as well as allow customers to track progress in real time.
            </p>
          </div>
        </div>
        <div
          class="lg:gap-11 xl:gap-12 shrink-0 flex flex-col items-start justify-between py-0 box-border text-15xl"
        >
          <div
            class="rounded-[20.03px] [background:linear-gradient(180.08deg,_#62cbab,_#effffa)] shrink-0 flex flex-col items-center justify-center py-[70px] px-5 border-[1px] border-solid border-lightgray"
          >
            <div
              class="shrink-0 flex flex-col items-start justify-center gap-[10px]"
            >
              <div
                class="relative tracking-[0.3px] leading-[27.4px] flex items-center w-72"
              >
                Configurable
              </div>
              <div
                class="relative text-mini tracking-[0.5px] leading-[26.4px] flex items-center w-[561px]"
              >
                Change language, turn on dark mode, save custom views, and
                more.
              </div>
            </div>
          </div>
          <div
            class="rounded-[20.03px] [background:linear-gradient(180.08deg,_#62cbab,_#effffa)] shrink-0 flex flex-col items-center justify-center py-[70px] px-5 border-[1px] border-solid border-lightgray"
          >
            <div
              class="shrink-0 flex flex-col items-start justify-center gap-[10px]"
            >
              <div
                class="relative tracking-[0.3px] leading-[27.4px] flex items-center w-72"
              >
                Configurable
              </div>
              <div
                class="relative text-mini tracking-[0.5px] leading-[26.4px] flex items-center w-[561px]"
              >
                Change language, turn on dark mode, save custom views, and
                more.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="w-full shrink-0 flex flex-row items-center justify-between text-5xl"
      >
        <div
          class="rounded-[20.03px] [background:linear-gradient(180deg,_#effef4,_#eefffa)] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] overflow-hidden flex flex-col items-center justify-start py-[25px] px-[22px] gap-[25px] border-[1px] border-solid border-lightgray"
        >
          <div
            class="shrink-0 flex flex-col items-start justify-center gap-[11px]"
          >
            <b class="relative tracking-[0.3px] leading-[27.4px]"
              >Multiplayer</b
            >
            <div
              class="relative text-base tracking-[0.5px] leading-[26.44px] font-dm-sans"
            >
              <p class="m-0">Collaborate efficiently with teammates in</p>
              <p class="m-0">real time thanks to co-presence indicators,</p>
              <p class="m-0">notes, and @mentions.</p>
            </div>
          </div>
          <div class="relative w-[349px] h-[158px]">
            <img
              class="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] rounded-3xs max-w-full overflow-hidden max-h-full object-cover"
              alt=""
              src="/public/image@2x.png"
            />
          </div>
        </div>
        <div
          class="rounded-[20.03px] [background:linear-gradient(180deg,_#effef4,_#eefffa)] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] overflow-hidden flex flex-col items-center justify-start py-[25px] px-[22px] gap-[25px] border-[1px] border-solid border-lightgray"
        >
          <div
            class="shrink-0 flex flex-col items-start justify-center gap-[11px]"
          >
            <b class="relative tracking-[0.3px] leading-[27.4px]"
              >Multiplayer</b
            >
            <div
              class="relative text-base tracking-[0.5px] leading-[26.44px] font-dm-sans"
            >
              <p class="m-0">Collaborate efficiently with teammates in</p>
              <p class="m-0">real time thanks to co-presence indicators,</p>
              <p class="m-0">notes, and @mentions.</p>
            </div>
          </div>
          <div class="relative w-[349px] h-[158px]">
            <img
              class="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] rounded-3xs max-w-full overflow-hidden max-h-full object-cover"
              alt=""
              src="/public/image@2x.png"
            />
          </div>
        </div>
        <div
          class="rounded-[20.03px] [background:linear-gradient(180deg,_#effef4,_#eefffa)] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] overflow-hidden flex flex-col items-center justify-start py-[25px] px-[22px] gap-[25px] border-[1px] border-solid border-lightgray"
        >
          <div
            class="shrink-0 flex flex-col items-start justify-center gap-[11px]"
          >
            <b class="relative tracking-[0.3px] leading-[27.4px]"
              >Multiplayer</b
            >
            <div
              class="relative text-base tracking-[0.5px] leading-[26.44px] font-dm-sans"
            >
              <p class="m-0">Collaborate efficiently with teammates in</p>
              <p class="m-0">real time thanks to co-presence indicators,</p>
              <p class="m-0">notes, and @mentions.</p>
            </div>
          </div>
          <div class="relative w-[349px] h-[158px]">
            <img
              class="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] rounded-3xs max-w-full overflow-hidden max-h-full object-cover"
              alt=""
              src="/public/image@2x.png"
            />
          </div>
        </div>
      </div>
    </main>
    <footer
      class="w-8/12 flex flex-row items-start lg:-mt-8 xl:-mt-7 justify-center"
    >
      <a
        href="#page1"
        class="shrink-0 flex flex-row items-center justify-start p-1.5 gap-[7px] text-[20px] text-colors-black-100 font-dm-sans"
      >
        <div
          class="relative tracking-[0.5px] leading-[26.44px] font-medium"
        >
          Go back
        </div>
        <img
          class="relative w-[14.7px] h-[27px] object-contain"
          alt=""
          src="/public/arrow-1-stroke@2x.png"
        />
      </a>
    </footer>
  </section>
</div>`;
  c2.scrollIntoView({ behavior: "smooth", block: "start" });
  c3.classList.add("hidden");
});
document.getElementById("link2").addEventListener("click", function () {
  // c2.classList.add("hidden");
  c3.classList.remove("hidden");
  c2.innerHTML = "";
  c2.classList.add("hidden");
  c3.scrollIntoView({ behavior: "smooth", block: "start" });
});

// const cursor = document.getElementById('custom-cursor');

// document.addEventListener('mousemove', function(e) {
//     cursor.style.left = e.clientX + 'px';
//     cursor.style.top = e.clientY + 'px';
// });
