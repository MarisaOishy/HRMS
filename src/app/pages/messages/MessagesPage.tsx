import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Search, Send, Paperclip, MoreVertical } from "lucide-react";
import { messages, employees } from "../../data/mockData";

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(messages[0]?.fromId || null);

  const selectedEmployee = employees.find((e) => e.id === selectedChat);

  return (
    <div className="h-[calc(100vh-12rem)]">
      <div className="flex h-full gap-6">
        {/* Chat List */}
        <Card className="w-80 flex-shrink-0">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type="search" placeholder="Search messages..." className="pl-10" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => setSelectedChat(message.fromId)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedChat === message.fromId
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={message.avatar}
                      alt={message.from}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{message.from}</p>
                      <p className="text-sm text-gray-600 truncate">{message.message}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{message.timestamp}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="flex-1">
          {selectedEmployee ? (
            <CardContent className="p-0 h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedEmployee.avatar}
                    alt={selectedEmployee.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{selectedEmployee.name}</p>
                    <p className="text-sm text-gray-600">{selectedEmployee.role}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex gap-3">
                  <img
                    src={selectedEmployee.avatar}
                    alt={selectedEmployee.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                      <p className="text-gray-900">
                        {messages.find((m) => m.fromId === selectedChat)?.message}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {messages.find((m) => m.fromId === selectedChat)?.timestamp}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <div>
                    <div className="bg-blue-600 text-white rounded-lg p-3 max-w-md">
                      <p>Sure, I'll review it and get back to you shortly.</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">Just now</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    AJ
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Input placeholder="Type a message..." className="flex-1" />
                  <Button>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p>Select a conversation to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
