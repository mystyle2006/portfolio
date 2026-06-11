@AGENTS.md

# 작업 규칙

- 파일 변경을 수반하는 작업이 끝나면 사용자 요청 없이 즉시 커밋한다.
- 커밋 후 `git push origin <branch>` 실행. remote가 없으면 사용자에게 알린다.

# 캔버스 렌더링 규칙

- 무한 캔버스에서 뷰포트에 보이는 섹션만 렌더한다. `CanvasNode`에 `width`/`height`를 전달하면 화면 밖일 때 언마운트된다.
- 단, 재마운트 시 애니메이션이 재실행되면 안 되는 섹션(ProfileSection, NavOrb 등)은 `width`/`height`를 전달하지 않아 culling에서 제외한다.
- 네비게이션으로 섹션을 벗어났다가 돌아와도 애니메이션이 다시 실행되지 않아야 한다. `skipAnimation` prop과 `onAnimationComplete` 콜백으로 완료 여부를 부모(PortfolioCanvas)에서 관리한다.
