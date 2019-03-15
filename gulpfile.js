const gulp = require("gulp");
const chmod = require("gulp-chmod");
const tsconfig = require("./tsconfig.json");
const package = require("./package");

const outDir = tsconfig.compilerOptions.outDir;

gulp.task("copy-files", (cb) => {
  gulp.src(["config.json", "package.json"])
    .pipe(gulp.dest(outDir));

  cb();
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
