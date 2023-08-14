const redis = require('redis');
let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));
  redisClient.on('connect', () => {
    console.log('Connected to Redis');
  });
  await redisClient.connect();
})();

async function storeListing(listing) {
    const key = `listing:${listing.id}`;
    const value = JSON.stringify(listing);
    await redisClient.set(key, value);
    console.log("listing stored")
}

function getListing(id, callback) {
    const key = `listing:${id}`;
    redisClient.get(key, (err, result) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, JSON.parse(result));
    });
}

async function getAllListings() {
    const all = await redisClient.hGetAll('listing')

    console.log("ALLG", all)
    // return new Promise((resolve, reject) => {
    //     redisClient.keys('listing:*', (err, keys) => {
    //         if (err) return reject(err);

    //         if (keys.length === 0) return resolve([]);

    //         const multi = redisClient.multi();
    //         keys.forEach(key => multi.get(key));

    //         multi.exec((err, listings) => {
    //             if (err) return reject(err);

    //             resolve(listings);
    //         });
    //     });
    // });
}

module.exports = {
    redisClient,
    storeListing,
    getListing,
    getAllListings
};