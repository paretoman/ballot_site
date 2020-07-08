## Digression: median systems

[skip this digression](newer#lightly-strategic-voting-normalization)

Ever watched the Olympics? In events like figure skating, there are a number of Olympic judges from different countries. In order to prevent any one judge from having too much influence, they use a "trimmed mean": they throw away the highest and lowest scores before they take the average. 

Olympic judges are supposedly supposed to be unbiased. But for voters, there's nothing wrong with having political opinions. (I mean, obviously your opinions, dear reader, are the best, and everybody else should just listen to you. But much as I'd like to, I can't force them to.) So let's imagine voting used the olympic system.

Throwing away just one highest and lowest score, with thousands or millions of voters, obviously wouldn't make an appreciable difference. So we'd have to throw away some more scores. And, why not? Let's throw away a few more while we're at it.

When should we stop? When there's just 1 or 2 scores left to take the average. But if you do that, most people wouldn't called that a "trimmed mean" anymore; they'd just call it the median, the middle number.

There are several voting methods that use the median to find the winner. (It turns out that can lead to a lot of ties, so you need a tiebreaker system to avoid that.) In the 1910s, over a dozen US cities, starting with Grand Junction, CO, used "Bucklin voting", a median-based system using a hybrid ranked/rated ballot. More recently, voting theorists Balinski and Laraki have proposed Majority Judgment, a median-based method using a rated ballot that's now been used in a number of competitions.

Using the median reduces the incentives for a single voter to strategize. After all, unless you happen to be the exact median rating for a candidate, the only thing that matters about the rating you gave them is whether it's above or below the median.

Still, large groups of voters can still get a strategic advantage. The larger the voting bloc, the greater the chance is that the median rating for a given candidate happens to be a voter in that bloc.

I used to think that median voting methods were the best. But then I did the simulations I'll talk about below, and they were merely OK; not much better outcomes than approval voting, but without the simplicity. I still think they're hugely better than FPTP and a bit better than IRV, but I'm not sold enough on them for it to be worth my time programming them in to Nicky's simulator.