import React, { useContext, useState } from 'react'
import myContext from '../../context/data/myContext'
import Layout from '../../components/layout/Layout'
import Loader from '../../components/loader/Loader'
import { collection, addDoc, getDocs, query } from "firebase/firestore";
import { fireDB, auth } from "../../firebase/FirebaseConfig";
import { toast } from "react-toastify";

function Order() {
  const userData = JSON.parse(localStorage.getItem("user"));
  const userid = userData?.uid || userData?.user?.uid;
  const context = useContext(myContext)
  const { mode, loading, order } = context
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const openReviewModal = async (product) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast.error("You must be logged in to review");
      return;
    }

    const reviewsRef = collection(fireDB, "products", product.id, "reviews");
    const q = query(reviewsRef);
    const snapshot = await getDocs(q);

    const alreadyReviewed = snapshot.docs.some(
      (doc) => doc.data().userId === userId
    );

    if (alreadyReviewed) {
      toast.info("You already reviewed this product.");
      return;
    }

    setSelectedProduct(product);
    setShowModal(true);
  };

  const submitReview = async () => {
    if (!auth.currentUser) {
      toast.error("Please log in to submit a review!");
      return;
    }

    const reviewsRef = collection(fireDB, "products", selectedProduct.id, "reviews");
    const snap = await getDocs(reviewsRef);
    if (snap.docs.some((doc) => doc.data().userId === auth.currentUser.uid)) {
      toast.info("You already reviewed this product.");
      return;
    }

    if (rating === 0) {
      toast.warning("Please Select a Rating.");
      return;
    }

    try {
      await addDoc(collection(fireDB, "products", selectedProduct.id, "reviews"), {
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || "User",
        rating,
        comment,
        createdAt: new Date(),
      });

      toast.success("Review submitted!");
      setShowModal(false);
      setRating(0);
      setComment("");
    } catch (err) {
      toast.error("Failed to submit review");
      console.log(err);
    }
  };

  return (
    <Layout>
      {loading && <Loader />}
      {order.length > 0 ?
        (<>
          <div className=" h-full pt-10">
            {
              order.filter(obj => obj.userid == userid).map((order) => {
                return (
                  <div className="mx-auto max-w-5xl justify-center px-6 md:flex md:space-x-6 xl:px-0">
                    {
                      order.cartItems.map((item) => {
                        return (
                          <div className="rounded-lg md:w-2/3">
                            <div
                              className="justify-between mb-6 rounded-lg bg-white p-6 shadow-md sm:flex sm:justify-start"
                              style={{
                                backgroundColor: mode === "dark" ? "#282c34" : "",
                                color: mode === "dark" ? "white" : "",
                              }}
                            >
                              <img
                                src={item.imageUrl}
                                alt="product-image"
                                className="rounded-lg sm:w-40 h-40 object-contain"
                              />

                              <div className="sm:ml-4 sm:flex sm:w-full sm:flex-col">

                                <div className="mt-5 sm:mt-0">
                                  <h2
                                    className="text-lg font-bold"
                                    style={{ color: mode === "dark" ? "white" : "" }}
                                  >
                                    {item.title}
                                  </h2>

                                  <p
                                    className="text-lg mt-1"
                                    style={{ color: mode === "dark" ? "white" : "" }}
                                  >
                                    ₹{item.price}
                                  </p>

                                  <p
                                    className="mt-1 text-sm opacity-80"
                                    style={{ color: mode === "dark" ? "white" : "" }}
                                  >
                                    {item.description}
                                  </p>
                                </div>

                                <div className="mt-6">
                                  <p
                                    className="text-lg font-medium mb-2"
                                    style={{ color: mode === "dark" ? "white" : "" }}
                                  >
                                    Status: {order.orderStatus}
                                  </p>

                                  {(() => {
                                    const ORDER_FLOW = [
                                      "Placed",
                                      "Dispatched",
                                      "In Transit",
                                      "Out for Delivery",
                                      "Delivered",
                                    ];

                                    const currentIndex = ORDER_FLOW.indexOf(order.orderStatus);
                                    const progressPercent = ((currentIndex + 1) / ORDER_FLOW.length) * 100;

                                    return (
                                      <div className="w-full h-2 bg-gray-300 rounded-full">
                                        <div
                                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                                          style={{ width: `${progressPercent}%` }}
                                        ></div>
                                      </div>
                                    );
                                  })()}

                                  {order.orderStatus === "Delivered" && (
                                    <button
                                      onClick={() => openReviewModal(item)}
                                      className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                                    >
                                      Review Product
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                )
              })
            }
          </div>
        </>)
        :
        (
          <h2 className=' text-center tex-2xl text-white'>Not Order</h2>
        )
      }

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="w-full max-w-lg p-8 rounded-2xl shadow-xl"
            style={{
              backgroundColor: mode === "dark" ? "#1f2937" : "white",
              color: mode === "dark" ? "white" : "black",
            }}
          >
            <h2 className="text-2xl font-semibold mb-6">
              Review Product
            </h2>
            <div
              style={{
                height: "6px",
                width: "100px",
                borderRadius: "9999px",
                background: "#d6336c",
                marginBottom: "24px"
              }}
            ></div>

            <p className="text-lg font-medium mb-4 opacity-80">
              {selectedProduct?.title}
            </p>

            <label className="block mb-2 font-medium">Rating</label>
            <div className="flex mb-5 text-3xl">
              {[1, 2, 3, 4, 5].map((num) => (
                <span
                  key={num}
                  onClick={() => setRating(num)}
                  className={`cursor-pointer transition ${rating >= num ? "text-yellow-400" : "text-gray-400"
                    }`}
                >
                  ★
                </span>
              ))}
            </div>

            <label className="block mb-2 font-medium">Feedback</label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border rounded-lg mb-6 focus:outline-none"
              style={{
                backgroundColor: mode === "dark" ? "#111827" : "#f9fafb",
                borderColor: mode === "dark" ? "#374151" : "#d1d5db",
                color: mode === "dark" ? "white" : "black",
              }}
              placeholder="Write your experience..."
            ></textarea>

            <div className="flex justify-end gap-4">
              <button
                className="px-5 py-2 rounded-lg font-medium"
                style={{
                  backgroundColor: mode === "dark" ? "#374151" : "#e5e7eb",
                  color: mode === "dark" ? "white" : "black",
                }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-5 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: "#6366f1" }}
                onClick={submitReview}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  )
}

export default Order