const gulp = require("gulp");
const ts = require("gulp-typescript");

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
});

gulp.task("build", gulp.series(modules));
