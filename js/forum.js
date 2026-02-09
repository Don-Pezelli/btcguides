(() => {
  const buildCard = (post, solutionLabel) => {
    const card = document.createElement("article");
    card.className = `forum-card${post.status === "solved" ? " forum-card-solved" : ""}`;

    const header = document.createElement("div");
    header.className = "forum-card-header";

    const title = document.createElement("h3");
    title.textContent = post.title;

    const tag = document.createElement("span");
    tag.className = "forum-tag";
    tag.textContent = post.course;

    header.appendChild(title);
    header.appendChild(tag);

    const summary = document.createElement("p");
    summary.textContent = post.summary;

    card.appendChild(header);
    card.appendChild(summary);

    if (post.solution) {
      const solution = document.createElement("div");
      solution.className = "forum-solution";
      const label = solutionLabel || "Solution";
      solution.innerHTML = `<strong>${label}:</strong> ${post.solution}`;
      card.appendChild(solution);
    }

    if (post.meta) {
      const meta = document.createElement("div");
      meta.className = "forum-meta";
      meta.textContent = post.meta;
      card.appendChild(meta);
    }

    return card;
  };

  const renderPosts = (containerId, posts, emptyId, solutionLabel) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    if (!posts || posts.length === 0) {
      const emptyState = document.getElementById(emptyId);
      if (emptyState) {
        emptyState.hidden = false;
      }
      return;
    }

    posts.forEach((post) => {
      container.appendChild(buildCard(post, solutionLabel));
    });
  };

  const initForum = async () => {
    const forumRoot = document.querySelector("[data-forum-src]");
    if (!forumRoot) return;

    const src = forumRoot.getAttribute("data-forum-src");
    const solutionLabel = forumRoot.getAttribute("data-solution-label") || "Solution";
    if (!src) return;

    try {
      const response = await fetch(src, { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load forum data");
      const data = await response.json();

      renderPosts("forum-recent-grid", data.recent, "forum-recent-empty", solutionLabel);
      renderPosts("forum-archive-list", data.archive, "forum-archive-empty", solutionLabel);
    } catch (error) {
      const fallback = document.getElementById("forum-load-error");
      if (fallback) {
        fallback.hidden = false;
      }
    }
  };

  document.addEventListener("DOMContentLoaded", initForum);
})();
