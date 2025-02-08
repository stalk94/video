//require('dotenv').config();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const propertyId = 476854907;
const client = new BetaAnalyticsDataClient({
    keyFilename: 'config/intimalive-b83203b7a9e5.json'
});




/**
 * Получить все события за время
 * @param {'today'|'30daysAgo'|'7daysAgo'} startDate 
 * @returns {Promise<Array<{
 *               date: string
 *               time: string
 *               name: string
 *               count: number
 *         }>>}
 */
async function getAnalyticsEvents(startDate) {
    const events = ['Выход', 'Авторизация', 'Регистрация', 'Переход к оплате', 'Супер поиск',
        'Платеж успешен', 'Платеж отмена', 'Сообшение', 'Супер лайк', 'Куплен подарок'
    ];

    const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: (startDate ?? '30daysAgo'), endDate: 'today' }],
        dimensions: [
            { name: 'eventName' },
            { name: 'date' },
            { name: 'dateHourMinute' }
        ], 
        metrics: [{ name: 'eventCount' }],      // Количество срабатываний
    });
    //console.log('Отчёт:', JSON.stringify(response.rows, null, 2));

    const result = [];
    response.rows?.map((elem)=> {
        const name = elem.dimensionValues[0].value;
        const value = elem.metricValues[0].value;
        const dateTime = elem.dimensionValues[2].value;

        if(events.includes(name)) {
            result.push({
                date: elem.dimensionValues[1].value,
                time: dateTime.substring(8, 10) + ":" + dateTime.substring(10, 12),
                name: name,
                count: +value
            });
        }
    });

    //console.log(result)
    return result;
}

/**
 * Получает стату гео данных по новым пользователям либо не новым (type)
 * @param {'today'|'30daysAgo'|'7daysAgo'} startDate 
 * @param {'activeUsers' | 'newUsers'} type 
 * @returns {Promise<Array<{
 *         date: string
 *         city: string
 *         country: string
 *         refer: string
 *         activeUsers?: number
 *         newUsers?: number
 *       }
 *   }>>}
 */
async function getAnalyticUsers(startDate, type) {
    const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: (startDate ?? '30daysAgo'), endDate: 'today' }],
        dimensions: [
            { name: 'country' },
            { name: 'city' },
            { name: 'date' },
            { name: 'pageReferrer'}
        ],   
        metrics: [
            { name: type ?? 'newUsers' }
        ],
    });

    const result = [];
    response.rows?.forEach((row)=> {
        result.push({
            date: row.dimensionValues[2].value,
            country: row.dimensionValues[0].value,
            city: row.dimensionValues[1].value,
            [type ?? 'newUsers']: row.metricValues[0].value,
            refer: row.dimensionValues[3].value
        });
    });

    //console.log(result)
    return result;
}

/**
 * Получить данные по источникам сессий пользователей ()
 * @param {'today'|'30daysAgo'|'7daysAgo'} startDate 
 * @param {'activeUsers' | 'newUsers'} type 
 * @returns {Promise<Array<{
 *          date: string
 *          city: string
 *          country: string
 *          source: '(not set)' | '(direct)' | 'Google' | 'Facebook' | 'Instagram' | string
 *          type: '(not set)' | '(none)' | 'organic' | 'referral' | 'cpc' | 'social'
 *          referer: string                
 *          sessions: number
 *          duration: number
 *          activeUsers?: number
 *          newUsers?: number
 *       }
 *   }>>}
 */
async function getTrafficSources(startDate, type) {
    const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: (startDate ?? '30daysAgo'), endDate: 'today' }],
        dimensions: [
            { name: 'city' },
            { name: 'country' },
            { name: 'sessionSource' },      // Источник (Google, Facebook, Instagram и т. д.)
            { name: 'sessionMedium' },      // Тип (organic, referral, cpc и т. д.)
            { name: 'pageReferrer'},
            { name: 'date' },
            //{ name: 'sessionCampaignName' },
        ],
        metrics: [
            { name: 'sessions' },
            { name: 'averageSessionDuration' },
            { name: type ?? 'newUsers' }
        ]
    });

    const result = [];
    response.rows?.forEach((row)=> {
        result.push({
            date: row.dimensionValues[5].value,
            city: row.dimensionValues[0].value,
            country: row.dimensionValues[1].value,
            source: row.dimensionValues[2].value,                   // (direct), Google, Facebook, Instagram ...
            type: row.dimensionValues[3].value,                     // (none), organic, referral, cpc, social.
            referer: row.dimensionValues[4].value,                  // refer
            sessions: +row.metricValues[0].value,                   // Количество сеансов
            duration: Math.round(+row.metricValues[1].value),       // в секундах
            [type ?? 'newUsers']: +row.metricValues[2].value                       // сколько посещений
        });
    });

    //console.log(result)
    return result;
}

/**
 * Уникальные пользователи откуда (с датами)
 * @param {'today'|'30daysAgo'|'7daysAgo'} startDate 
 * @returns {Promise<Array<{
 *       date: string
 *       uniqueUsers: number
 *       city: string
 *       country: string
 *       refer: string
 *       device: desktop | mobile | tablet
 *       deviceModel: string
 *   }>>>}
 */
async function getUniqueUsers(startDate = '30daysAgo') {
    const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate: 'today' }],
        metrics: [
            { name: 'newUsers' }
        ],
        dimensions: [
            { name: 'date' },
            { name: 'city' },
            { name: 'country' },
            { name: 'pageReferrer'},
            { name: 'deviceCategory' },
            { name: 'mobileDeviceModel' }
        ],
    });

    // Выводим результат
    const result = response.rows?.map(row => ({
        date: row.dimensionValues[0].value, // Дата
        uniqueUsers: +row.metricValues[0].value, // Уникальные пользователи
        city: row.dimensionValues[1].value,
        country: row.dimensionValues[2].value,
        refer: row.dimensionValues[3].value,
        device: row.dimensionValues[4].value,
        deviceModel: row.dimensionValues[5].value
    }));

    //console.log(result)
    return result;
}


async function getTotalNewUsers(startDate) {
    const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: (startDate ?? '30daysAgo'), endDate: 'today' }],
        metrics: [
            { name: 'newUsers' }
        ]
    });

    // Извлекаем и возвращаем общее количество новых пользователей
    const totalNewUsers = response.rows?.[0]?.metricValues?.[0]?.value || 0;

    return totalNewUsers;
}
async function getTotalActiveUsers(startDate) {
    const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: (startDate ?? '30daysAgo'), endDate: 'today' }],
        metrics: [
            { name: 'activeUsers' }
        ]
    });

    // Извлекаем и возвращаем общее количество новых пользователей
    const totalUsers = response.rows?.[0]?.metricValues?.[0]?.value || 0;
    
    return totalUsers;
}



module.exports = {
    getAnalyticsEvents,
    getAnalyticUsers,
    getTrafficSources,
    getUniqueUsers,
    getTotalNewUsers,
    getTotalActiveUsers
}