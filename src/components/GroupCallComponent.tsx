/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC, { type IAgoraRTCClient, type ILocalVideoTrack, type ILocalAudioTrack } from 'agora-rtc-sdk-ng';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaSpinner } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;
const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

const client: IAgoraRTCClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const GroupCallComponent: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const { currentUser, token } = useAuth(); // NEW: Get 'token' from useAuth
    const [joined, setJoined] = useState<boolean>(false);
    const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | undefined>(undefined);
    const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | undefined>(undefined);
    const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
    const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

    const localVideoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!groupId || !currentUser?.uid || !token || joined) {
        setIsLoading(false);
        return;
    }

    const joinCall = async () => {
            try {
                // 1. Get token from backend
                const response = await axios.post(
    `${API_URL}/agora/rtc-token`, 
    { 
        channelName: groupId, 
        uid: currentUser.uid 
    }, 
    {
        headers: { Authorization: `Bearer ${token}` }
    }
);
                const { token: rtcToken, uid } = response.data; // Changed variable name to avoid conflict

                // 2. Join the Agora channel
                await client.join(APP_ID, groupId, rtcToken, uid);
                setJoined(true);

                // 3. Get local audio/video tracks
                const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
                setLocalAudioTrack(audioTrack);
                setLocalVideoTrack(videoTrack);
                
                // 4. Play local video in the designated container
                if (localVideoRef.current) {
                    videoTrack.play(localVideoRef.current);
                }

                // 5. Publish tracks
                await client.publish([audioTrack, videoTrack]);

                setIsLoading(false);
            } catch (error) {
                console.error("Failed to join Agora channel:", error);
                setIsLoading(false);
            }
        };

        const handleUserPublished = (user: any, mediaType: "audio" | "video") => {
            client.subscribe(user, mediaType).then(() => {
                if (mediaType === "video") {
                    const remoteVideoDiv = document.createElement("div");
                    remoteVideoDiv.id = user.uid.toString();
                    remoteVideoDiv.className = "w-full h-full";
                    document.getElementById("remote-video-container")?.appendChild(remoteVideoDiv);
                    user.videoTrack.play(remoteVideoDiv);
                }
                if (mediaType === "audio") {
                    user.audioTrack.play();
                }
            });
        };

        const handleUserUnpublished = (user: any) => {
            setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
            const remoteVideoDiv = document.getElementById(user.uid.toString());
            if (remoteVideoDiv) {
                remoteVideoDiv.remove();
            }
        };
        
        client.on("user-published", handleUserPublished);
        client.on("user-unpublished", handleUserUnpublished);
        client.on("user-joined", user => {
            setRemoteUsers(prev => [...prev, user]);
        });
        client.on("user-left", user => {
            setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
            const remoteVideoDiv = document.getElementById(user.uid.toString());
            if (remoteVideoDiv) {
                remoteVideoDiv.remove();
            }
        });


        joinCall();

        return () => {
            if (joined) {
                localAudioTrack?.close();
                localVideoTrack?.close();
                client.leave();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId, currentUser?.uid, joined, token]); // NEW: Add 'token' to the dependency array

    const leaveCall = async () => {
        if (localAudioTrack) localAudioTrack.close();
        if (localVideoTrack) localVideoTrack.close();
        await client.leave();
        setJoined(false);
        setLocalAudioTrack(undefined);
        setLocalVideoTrack(undefined);
        setRemoteUsers([]);
        window.location.href = '/';
    };
    
    const toggleVideo = () => {
        if (localVideoTrack) {
            localVideoTrack.setEnabled(!videoEnabled);
            setVideoEnabled(!videoEnabled);
        }
    };

    const toggleAudio = () => {
        if (localAudioTrack) {
            localAudioTrack.setEnabled(!audioEnabled);
            setAudioEnabled(!audioEnabled);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen mt-24">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
                <p className="ml-4 text-xl">Joining call...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen mt-16 bg-gray-900 text-white">
            <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
                <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg aspect-video">
                    <div ref={localVideoRef} className="w-full h-full" id="local-video"></div>
                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-full text-xs">You</div>
                </div>
                <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg aspect-video" id="remote-video-container">
                    {remoteUsers.length === 0 && (
                        <div className="absolute inset-0 flex justify-center items-center text-gray-500 text-lg">
                            Waiting for others to join...
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center items-center p-4 bg-gray-800 space-x-4">
                <button onClick={toggleAudio} className={`p-4 rounded-full transition-colors ${audioEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                    {audioEnabled ? <FaMicrophone size={24} /> : <FaMicrophoneSlash size={24} />}
                </button>
                <button onClick={toggleVideo} className={`p-4 rounded-full transition-colors ${videoEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'}`}>
                    {videoEnabled ? <FaVideo size={24} /> : <FaVideoSlash size={24} />}
                </button>
                <button onClick={leaveCall} className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors">
                    <FaPhoneSlash size={24} />
                </button>
            </div>
        </div>
    );
};

export default GroupCallComponent;