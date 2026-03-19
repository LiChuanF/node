import { injectable } from "inversify";
import jsonwebtoken from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

@injectable()
export class JWT {
    private jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET as string,
    };
    constructor() {
        this.strategy();
    }

    /**
     * 创建token
     * @param payload 
     * @returns 
     */
    public createToken(payload: object) {
        return jsonwebtoken.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: "1h",
        });
    }

    public strategy() {
        let strategy = new Strategy(this.jwtOptions, (jwtPayload, done) => {
            return done(null, jwtPayload);
        });
        passport.use(strategy);
    }

    /**
     * 中间件
     */
    static middleware() {
        return passport.authenticate("jwt", { session: false });
    }

    /**
     * 集成到express
     */
    public init() {
        return passport.initialize();
    }
}
