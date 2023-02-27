import { useEffect, useState } from "react";
import {
  urlClient,
  LENS_HUB_CONTRACT_ADDRESS,
  queryRecommendedProfiles,
  queryExplorePublications,
} from "./queries";
import LENSHUB from "./lenshub";
import { ethers } from "ethers";
import { Box, Button, Image, Input } from "@chakra-ui/react";
import { AiOutlinePlusCircle } from "react-icons/ai";

function App() {
  const [account, setAccount] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);

  async function signIn() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  }

  async function getRecommendedProfiles() {
    const response = await urlClient
      .query(queryRecommendedProfiles)
      .toPromise();
    const profiles = response.data.recommendedProfiles.slice(0, 5);
    setProfiles(profiles);
  }

  async function getPosts() {
    const response = await urlClient
      .query(queryExplorePublications)
      .toPromise();

    const posts = response.data.explorePublications.items.filter((post) => {
      if (post.profile) return post;
      return "";
    });
    setPosts(posts);
  }

  async function follow(id) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      LENS_HUB_CONTRACT_ADDRESS,
      LENSHUB,
      provider.getSigner()
    );
    const tx = await contract.follow([parseInt(id)], [0x0]);
    await tx.wait();
  }

  useEffect(() => {
    getRecommendedProfiles();
    getPosts();
  }, []);

  const parseImageUrl = (profile) => {
    if (profile) {
      const url = profile.picture?.original?.url;
      if (url && url.startsWith("ipfs:")) {
        const ipfsHash = url.split("//")[1];
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      }

      return url;
    }

    return "/default-avatar.png";
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <Box width="100%" backgroundColor="rgba(9,1,23,1)">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="80%"
          margin="auto"
          color="white"
          padding="10px 0"
        >
          <Box>
            <Box fontFamily="hypik" fontSize="44px">
              IIIverse
            </Box>
            <Box fontFamily="neonfuture">- the new social vision -</Box>
          </Box>
          {account ? (
            <Box backgroundColor="#c51f5d" padding="15px" borderRadius="6px">
              Connected
            </Box>
          ) : (
            <Button
              onClick={signIn}
              color="rgba(5,32,64)"
              _hover={{ backgroundColor: "#808080" }}
            >
              Connect
            </Button>
          )}
        </Box>
      </Box>

      {/* CONTENT */}
      <Box
        display="flex"
        justifyContent="space-between"
        flexDirection="column"
        color="white"
        className="content"
      >
        {/* FRIEND SUGGESTIONS */}
        <Box
          backgroundColor="rgba(9,1,23,1)"
          padding="20px 40px"
          borderRadius="15px"
          overflowX="scroll"
          margin="20px 0"
        >
          <Box fontFamily="neonfuture">FRIEND SUGGESTIONS</Box>
          <Box display="flex" flexDirection="row">
            {profiles.map((profile, i) => (
              <Box
                key={profile.id}
                margin="10px 20px"
                display="flex"
                alignItems="center"
                height="100px"
                padding="5px 10px"
                _hover={{ color: "#808080", cursor: "pointer" }}
                borderRadius="5px"
                backgroundColor="#c51f5d"
              >
                <img
                  alt="profile"
                  src={parseImageUrl(profile)}
                  width="40px"
                  height="40px"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = "/default-avatar.png";
                  }}
                />
                <Box marginLeft="25px">
                  <h4>{profile.name}</h4>
                  <p>{profile.handle}</p>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        {/* POSTS */}
        <Box>
          <Box
            marginBottom="25px"
            backgroundColor="rgba(9,1,23,1)"
            padding="20px 40px"
            borderRadius="15px"
            color="gray"
            display="flex"
            border="2px solid #c51f5d"
            width="fit-content"
          >
            <Input
              type="text"
              placeholder="Create new post"
              marginRight="10px"
              borderColor="gray"
              maxWidth="600px"
            />
            <AiOutlinePlusCircle size="40px" color="gray" />
          </Box>
          {posts.map((post) => (
            <Box
              key={post.id}
              marginBottom="25px"
              backgroundColor="rgba(9,1,23,1)"
              padding="20px 40px"
              borderRadius="15px"
              border="2px solid #c51f5d"
            >
              <Box display="flex">
                {/* PROFILE IMAGE */}
                <Box width="50px" height="50px" marginTop="8px">
                  <img
                    alt="profile"
                    src={parseImageUrl(post.profile)}
                    width="50px"
                    height="50px"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src = "/default-avatar.png";
                    }}
                  />
                </Box>

                {/* POST CONTENT */}
                <Box flexGrow={1} marginLeft="20px">
                  <Box display="flex" justifyContent="space-between">
                    <Box fontFamily="DM Serif Display" fontSize="24px">
                      {post.profile?.handle}
                    </Box>
                    <Box height="50px" _hover={{ cursor: "pointer" }}>
                      <Image
                        alt="follow-icon"
                        src="/follow-icon.png"
                        width="50px"
                        height="50px"
                        onClick={() => follow(post.id)}
                      />
                    </Box>
                  </Box>
                  <Box overflowWrap="anywhere" fontSize="14px">
                    {post.metadata?.content}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </div>
  );
}

export default App;
