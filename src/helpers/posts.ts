export const anonymizePosts = (posts: any[]) => {
  const sortedPosts = posts.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return sortedPosts.map((post) => {
    const postObj = post.toObject ? post.toObject() : post;
    //mongoose returns documents not plain objects so toObject converts them to js objects

    return {
      ...postObj,
      author: {
        _id: postObj.author?._id,
        username: "anon",
        profile: postObj.author?.profile,
      },
    };
  });
};

export const getVisiblePosts = (posts: any[], currentUser: any) => {
  if (!currentUser || !currentUser.membership) {
    return anonymizePosts(posts);
  }

  const sortedPosts = posts.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return sortedPosts.map((post) => {
    const postObj = post.toObject ? post.toObject() : post;
    return {
      ...postObj,
      author: {
        _id: postObj.author?._id || null,
        username: postObj.author?.username || "nobody",
        profile:
          postObj.author?.profile ||
          "linear-gradient(to left top, #001bff, fuchsia",
      },
    };
  });
};
