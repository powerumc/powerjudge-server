const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsconfig = require("./tsconfig.json");

gulp.task("copy-files", (cb) => {
  gulp.src(["config.json", "package.json"])
    .pipe(gulp.dest(tsconfig.compilerOptions.outDir));

  cb();
});

gulp.task("chmod", () => {
  const src = package.bin["powerjudge-api-server"];
  gulp.src(src)
    .pipe(chmod(0o755));
});

gulp.task("default", gulp.parallel(
  [
    "copy-files",
    "chmod"
  ]
));
