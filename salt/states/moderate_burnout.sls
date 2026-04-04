create_moderate_log:
  file.append:
    - name: /mnt/c/projects/academic-burnout-companion/logs/system.log
    - text: "MODERATE BURNOUT detected"

suggest_break:
  cmd.run:
    - name: echo Take short breaks using Pomodoro