const gulp = require("gulp");
const tsconfig = require("./tsconfig.json");

const packages = {
  "api": ts.createProject("./packages/api/tsconfig.json")
};

const modules = Object.keys(packages);

modules.forEach(module => {
  gulp.task(module, () => {
    return packages[module]
      .src()
      .pipe(packages[module]())
      .pipe(gulp.dest(`dist/${module}`));
  });
  cb();
});

gulp.task("copy-files", (cb) => {
  gulp.src(["config.json", "package.json"])
    .pipe(gulp.dest(outDir));
});

gulp.task("chmod", (cb) => {
  const src = package.bin["powerjudge-api-server"];
  gulp.src(src)
    .pipe(chmod(0o755));

  cb();
});

gulp.task("default", gulp.parallel(
  [
    "copy-files",
    "chmod"
  ]
));

gulp.task("build", gulp.series(modules));
