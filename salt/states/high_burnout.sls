create_high_log:
  file.append:
    - name: /mnt/c/projects/academic-burnout-companion/logs/system.log
    - text: "HIGH BURNOUT detected"

alert_user:
  cmd.run:
    - name: echo High burnout detected

create_alert_file:
  file.touch:
    - name: /mnt/c/projects/academic-burnout-companion/logs/high_alert.txt