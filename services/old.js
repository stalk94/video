start(myPeerId) {
    /**@type {User} */
    const user = online.online[myPeerId];

    if(user) {
        const revality = user.getRevality();
        const activateSex = user.getSexActivate();
        const countsOnline = online.getCountsOnline();
        user.start();
        const filter = [];

        // алгоритм поиска
        Object.values(online.online).forEach((elem)=> {
            if(elem.peerId !== myPeerId && elem.onStart) {
                const isStory = user.story[elem.login];                                         
                const data = {
                    revality: 100,
                    data: elem
                }
                
                // базовые кооэфициенты
                if(elem._bot) data.revality = 50;           // бот
                else data.revality = 100;                   // юзер

                // супер поиск активен
                if(revality === 100) {
                    if(elem._bot) {
                        data.revality = 10;
                        // мало людей онлайн
                        if(countsOnline.users < 3) data.revality = 30;
                    }
                    else {
                        data.revality = 60;
                        if(elem.sex === activateSex) data.revality = 100;
                    }
                }
                // статус новичка
                else if(revality === 80) {
                    if(elem._bot) data.revality = 40;
                    else {
                        data.revality = 40;
                        if(elem.sex === activateSex) data.revality = 60;
                        // увеличиваем если людей мало
                        if(countsOnline.users < 3) data.revality += 10;
                    }
                }
                // статус премиум
                else if(revality === 60) {
                    if(elem._bot) data.revality = 40;
                    else {
                        data.revality = 40;
                        if(elem.sex === activateSex) data.revality = 60;
                        // увеличиваем если людей мало
                        if(countsOnline.users < 3) data.revality += 10;
                    }
                }
                // нет ничего
                else if(revality === 20) {
                    if(elem._bot) {
                        data.revality = 70;
                        // уменьшаем если людей много
                        if(countsOnline.users > 3) data.revality -= 20;
                    }
                    else {
                        data.revality = 20;
                        if(elem.sex === activateSex) data.revality = 30;
                        // увеличиваем если людей мало
                        if(countsOnline.users < 3) data.revality += 10;
                    }
                }

                // много ботов и есть в истории такой
                if(countsOnline.bots > 4 && elem._bot && isStory) {
                    if(isStory===1) data.revality = (data.revality/2);
                    else if(isStory>1 && isStory<=3) data.revality = (data.revality/4);
                    else if(isStory > 3) data.revality = (data.revality/6);
                }

                data.revality = Math.floor(data.revality);
                filter.push(data);
            }
        });
        

        if(filter.length >= 1) {
            const ranging =()=> {
                const ovnerIdFilter = rand.getRandom(0, filter.length - 1);   // тестируемый акк (random)
                const randomProcent = rand.getRandom(0, 100);

                console.log(filter[ovnerIdFilter].data.login+": ", randomProcent, "/ "+filter[ovnerIdFilter].revality);

                if(filter[ovnerIdFilter].revality >= randomProcent) {
                    return filter[ovnerIdFilter].data;
                }
            }
            const ovner = ranging();

            if(ovner && !ovner.curentCall) {
                this.call(myPeerId, ovner.peerId);
            }
        }
    }
}