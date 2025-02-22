!(async function () {
  const e = document
      .querySelector('a[href*="/users/"]')
      .href.replace(/^.*\/users\/(.*)$/, "$1"),
    t = async (e) =>
      fetch(`https://api-pedia.watcha.com${e}`, {
        credentials: "same-origin",
        headers: {
          "x-watcha-client": "watcha-WebApp",
          "x-watcha-client-language": "ko",
          "x-watcha-client-region": "KR",
          "x-watcha-client-version": "2.0.0",
        },
      })
        .then((e) => e.json())
        .then((e) => e.result),
    n = (e) => {
      const t = e.content.code,
        n = `https://pedia.watcha.com/ko-KR/contents/${t}`,
        a = e.content.title.replace(/"/g, ""),
        i = "tv_seasons" === e.content.content_type ? "TV" : "MOVIE",
        r = e.content.year,
        s = e.content.director_names?.join(),
        o = e.user_content_action.watched_at || e.created_at,
        c = +e.user_content_action.rating / 2,
        l = e.text?.trim().replace(/"/g, '""');
      return {
        id: t,
        url: n,
        title: a,
        type: i,
        year: r,
        directors: s,
        watchedAt: o,
        rating: c,
        review: l,
        spoiler: e.spoiler,
      };
    },
    a = async (e, a) => {
      let i = await t(e);
      const r = [];
      i.result.forEach((e) => {
        r.push(n(e));
      });
      let s = i.next_uri;
      for (; s; )
        (i = await t(s)),
          i.result.forEach((e) => {
            r.push(n(e));
          }),
          a && a(i.result.length),
          (s = i.next_uri);
      return r;
    },
    i = async (t, n) => {
      let i = 0;
      const r = (e) => {
          (i += e), n && n(i);
        },
        s = await a(`/api/users/${e}/contents/${t}/ratings`, r),
        o = await a(`/api/users/${e}/contents/${t}/comments`, r);
      return s.map((e) => {
        const t = o.find((t) => t.id === e.id);
        let n = t?.watchedAt || e.watchedAt;
        if (n) {
          const e = new Date(n);
          n = `${e.getFullYear()}-${`0${e.getMonth() + 1}`.slice(
            -2
          )}-${`0${e.getDate()}`.slice(-2)}`;
        }
        return [
          e.id,
          e.url,
          e.title,
          e.type,
          e.year,
          t?.directors || e.directors,
          n,
          e.rating,
          t?.review,
          t?.spoiler,
        ];
      });
    };
  await (async () => {
    const { setProgress: n, destroy: a } = (() => {
      const e = Object.assign(document.createElement("div"), {
          style:
            "position: fixed; left: 0; top: 0; right: 0;height: 59px; z-index:60;display:flex; align-items: center; background-color:#fff",
        }),
        t = Object.assign(document.createElement("div"), {
          style:
            "max-width:1320px;width:100%;height:100%;margin:0 auto;display:flex; align-items: center;padding:0 32px;",
        }),
        n = document.styleSheets[0];
      try {
        n.insertRule(
          "@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(359deg);} }",
          n.cssRules.length
        );
      } catch (e_) {}
      const a = Object.assign(document.createElement("div"), {
          style:
            "width: 26px; height: 26px; border: 3px solid rgb(229, 229, 229); border-radius: 100%; position: relative; margin-right:24px;",
          innerHTML:
            '<div style="display: block; position: absolute; top: -3px; left: -3px; width: 100%; height: 100%; border-width: 3px; border-style: solid; border-color: rgb(255, 47, 110) transparent transparent; border-radius: 100%; animation: 1s linear 0s infinite normal none running spin;"></div>',
        }),
        i = Object.assign(document.createElement("p"), {
          style: "color: #7e7e7e; font-size: 15px; letter-spacing: -0.3px;",
        });
      i.innerText = "리뷰 다운로드 중입니다.";
      const r = Object.assign(document.createElement("span"), {
        style: "font-weight: bold",
      });
      return (
        i.appendChild(r),
        t.appendChild(a),
        t.appendChild(i),
        e.appendChild(t),
        document.body.appendChild(e),
        {
          setProgress(e) {
            r.innerText = `${e.toFixed(0)}%`;
          },
          destroy() {
            e.remove();
          },
        }
      );
    })();
    try {
      const a = await (async () =>
          (
            await t(`/api/users/${e}`)
          ).ratings_count)(),
        r = (e = 0) => {
          a && e && n((e / a) * 100);
        },
        s = await i("movies", r),
        o = await i("tv_seasons", r);
      const bom = "\uFEFF";
      let c = s.map((e) => `"${e.join('","')}"`).join("\n");
      (c += "\n"),
        (c += o.map((e) => `"${e.join('","')}"`).join("\n")),
        ((e, t) => {
          const n = new window.Blob([t], { type: "text/utf-8" }),
            a = document.createElement("a");
          (a.href = URL.createObjectURL(n)), (a.download = e), a.click();
        })(
          `${e}-watcha.csv`,
          `${bom}ID,URL,Title,Type,Year,Directors,WatchedAt,Rating,Review,Spoiler\n${c}`
        );
    } catch (e) {}
    a();
  })();
})();
