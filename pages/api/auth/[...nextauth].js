import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import spotifyApi,{ LOGIN_URL } from "../../../lib/spotify"


async function refreshAccessToken(token){
    try{
      spotifyApi.setAccessToken(token.accessToken);
      spotifyApi.setRefreshToken(token.refreshToken);

      const {body: refreshedToken} = await spotifyApi.refreshAccessToken();
      console.log('Refreshed Access token ', refreshedToken);

      return{
        ...token,
        accessToken: refreshedToken.access_token,
        accessTokenExpires: Date.now() + refreshedToken.expires_in * 1000,
        refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
        // Replace if new once came back else fall back to previous one 
      }


    }catch(error){
        console.error(error);
        return{
            ...token,
            error: "RefreshAccessTokenError"
        }

    }
}


export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authorization: LOGIN_URL
    }),
    // ...add more providers here
  ],
  secret: process.env.JWT_SECRET,
  pages:{
      signIn: '/login'
  },
  callbacks:{
      async jwt({token, account, user}){
          
        //  initial sign in 
        if(account && user){
            // console.log('account-->',account);
            return {
                ...token,
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                username: account.providerAccountId,
                accessTokenExpires: account.expires_at * 1000
            }
        }

        // Return to previous token if the access token is not expired yet
        if(Date.now() < token.accessTokenExpires){
            return token;
        }

        // Access token has expired, so we need to refresh it
        return await refreshAccessToken(token);

      },
      async session({session, token}){
        // session
        // console.log('session-->',session);
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
        session.user.username = token.username;
        return session;
      },
  },
})