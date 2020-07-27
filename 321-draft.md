

## 3-2-1 voting

In 3-2-1 voting, voters rate each candidate "Good", "OK", or "Bad". To find the winner, you first narrow it down to three semifinalists, the candidates with the most "good" ratings. Then, narrow it further to two finalists, the candidates with the fewest "bad" ratings. Finally, the winner is the one preferred on more ballots.

3-2-1 voting is another method that avoids the chicken dilemma by addressing scoring strategies.

3-2-1 voting is doing something similar to STAR by adding a second additional round of counting votes. It's kind of like there are two rounds of counting approval ballots and one round of counting preference ballots. The first round of approval just counts "good". The second round counts "good" and "okay".

Important todo: I haven't put good strategies into 3-2-1 yet. Right now, these strategies are okay for this example, but other examples might not be correct.

{% include sim.html
link="[link](http://127.0.0.1:4000/ballot/sandbox/?v=2.5&m=H4sIAAAAAAAAA3VSy2oDMQz8F59NsWTZ1u65n5Dbsoe22ZJASEIelFLab6_kIS2lhD2M9djxjKyPkMI4TXWIpGWOE5VqJ7YTF_45SWSheY6BvJmSRsrJ4xzGFIOEMXxRDjGUMFIM1bqs2AxS_PdZRe9WhrsVSv0ucgnVRGbPMXKQQQIogNq1kKkgMbQ7HYZe5NQjpt7DDAANCyKjyQYVyYZIERkLm3ufHZs-8lGAKzNK4MrgysY1Ueyft1b0gDPDM0WO7kmc1LvEnbpz4dvBSKfeI_1P-UsrcCwNjwKpMvRkwfQKASCyZABEFjxegeHSUNN-U4HhmgCwWjH9Cqu1dBsur4KiQkHFyBsUNPzboKBlRHi5hpdrt_1pKOrvfKJ4HpY0AagzKcQoxCgIFYQKPQo-hSx1WQ_FVg7Cnp92u8Nl9X5cbJtXm9Oy2D6fN4e3x-X8ctoeL9vD3vf8ul8vr9v9sg6f3_tmOp49AwAA)"
title = "3-2-1 Strategy"
caption = "These strategies try to give frontrunners their own score with three levels of support."
id = "ballot10"
comment = "one-voter 3-2-1"
%}

Here again, the game of chicken is not being played anymore. The Frontrunner strategy doesn't change the result from Normalize strategy. Candidates wouldn't have to go negative against their nearby rivals in order to ensure that their voters would at least be moderately strategic and wouldn't just normalize.

{% include sim.html
link="[link](http://127.0.0.1:4000/ballot/sandbox/?v=2.5&m=H4sIAAAAAAAAA3WSQWoDMQxF7-K1KJZkyXbOkV2SRQsJXQRSSjelNGevrE9gSimz-CNL_n6S_VVq2R0OLEzc5okOzIO41_U3G7HN04kKZw07RV3WxN9oWWNRY6tGy65SaWVX7qyFimXssTOSPSSMRWgK1e0XyRHJSn--yMx_M1zTnhcZM7mTz7UsWNaFcSy3y-VYgoUDi0PAxA4JKG6hcb6GxGFCRcI4FoVzhwgEzQlsxHKDwEY6ooEILlqTnEnWZOCl8FLNeoWX2mogCnkVOjbDUefGo9XHKFbA20A2Dk23QUuftj2ieR7bOm4L0G3momGmxhBJGFMIcM0gaN06cuP3tA0z8ApB946bcUzSLTvQIHJ4OVB8pnSgdOztQOmKqCGHy-yPF9aRHI-hkVJb6-htVAgMB2AGYAbmNCxPGeAZ8BvAGgvryeJFAuzl-Xq9few_387R-v71_Xwu3z-WC-vnSwMAAA)"
title = "Not Playing Chicken with 3-2-1 Voting"
caption = ""
id = "election14"
comment = "chicken with 3-2-1"
%}